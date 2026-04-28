import { Env } from "./airtable";
import { ga4Batch, GA4Row } from "./ga4";

const PERIODS = [
  { label: "7d", startDate: "7daysAgo" },
  { label: "14d", startDate: "14daysAgo" },
  { label: "30d", startDate: "30daysAgo" },
  { label: "90d", startDate: "90daysAgo" },
];

interface PeriodReport {
  activeUsers: number;
  pageViews: number;
  avgDuration: number;
  bounceRate: number;
  topPages: { path?: string; views: number }[];
  trafficSources: { name?: string; sessions: number }[];
  devices: { name?: string; users: number }[];
  referrers: { name?: string; sessions: number }[];
  dailyTrend: { date?: string; users: number; pageViews: number }[];
  regions: { name?: string; users: number }[];
}

async function reportSet(
  env: Env,
  startDate: string,
  endDate: string,
): Promise<PeriodReport> {
  const dateRanges = [{ startDate, endDate }];

  // 7 reports를 batchRunReports 2개로 분할 (max 5 reports/batch)
  // batch1: metrics, pages, sources, devices, refs (5)
  // batch2: trend, geo (2)
  const batch1Requests = [
    {
      dateRanges,
      metrics: [
        { name: "activeUsers" },
        { name: "screenPageViews" },
        { name: "averageSessionDuration" },
        { name: "bounceRate" },
      ],
    },
    {
      dateRanges,
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 10,
    },
    {
      dateRanges,
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 10,
    },
    {
      dateRanges,
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
    },
    {
      dateRanges,
      dimensions: [{ name: "sessionSource" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 10,
    },
  ];
  const batch2Requests = [
    {
      dateRanges,
      dimensions: [{ name: "date" }],
      metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
      orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
    },
    {
      dateRanges,
      dimensions: [{ name: "region" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 10,
    },
  ];

  const [batch1, batch2] = await Promise.all([
    ga4Batch(env, batch1Requests),
    ga4Batch(env, batch2Requests),
  ]);
  const [metrics, pages, sources, devices, refs] = batch1;
  const [trend, geo] = batch2;

  const mv = metrics.rows?.[0]?.metricValues || [];

  return {
    activeUsers: Number(mv[0]?.value || 0),
    pageViews: Number(mv[1]?.value || 0),
    avgDuration: Number(Number(mv[2]?.value || 0).toFixed(1)),
    bounceRate: Number(Number(mv[3]?.value || 0).toFixed(4)),
    topPages: (pages.rows || []).map((r: GA4Row) => ({
      path: r.dimensionValues?.[0]?.value,
      views: Number(r.metricValues?.[0]?.value || 0),
    })),
    trafficSources: (sources.rows || []).map((r: GA4Row) => ({
      name: r.dimensionValues?.[0]?.value,
      sessions: Number(r.metricValues?.[0]?.value || 0),
    })),
    devices: (devices.rows || []).map((r: GA4Row) => ({
      name: r.dimensionValues?.[0]?.value,
      users: Number(r.metricValues?.[0]?.value || 0),
    })),
    referrers: (refs.rows || []).map((r: GA4Row) => ({
      name: r.dimensionValues?.[0]?.value,
      sessions: Number(r.metricValues?.[0]?.value || 0),
    })),
    dailyTrend: (trend.rows || []).map((r: GA4Row) => ({
      date: r.dimensionValues?.[0]?.value,
      users: Number(r.metricValues?.[0]?.value || 0),
      pageViews: Number(r.metricValues?.[1]?.value || 0),
    })),
    regions: (geo.rows || []).map((r: GA4Row) => ({
      name: r.dimensionValues?.[0]?.value,
      users: Number(r.metricValues?.[0]?.value || 0),
    })),
  };
}

async function upsertPeriod(
  env: Env,
  date: string,
  period: string,
  data: PeriodReport,
  dailyTrendOverride?: string,
): Promise<void> {
  await env.DB.prepare(
    `INSERT OR REPLACE INTO analytics_daily
     (date, period, active_users, page_views, avg_duration, bounce_rate,
      top_pages, traffic_sources, devices, referrers, daily_trend, regions)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      date,
      period,
      data.activeUsers,
      data.pageViews,
      data.avgDuration,
      data.bounceRate,
      JSON.stringify(data.topPages),
      JSON.stringify(data.trafficSources),
      JSON.stringify(data.devices),
      JSON.stringify(data.referrers),
      dailyTrendOverride ?? JSON.stringify(data.dailyTrend),
      JSON.stringify(data.regions),
    )
    .run();
}

export interface CronAnalyticsResult {
  ok: boolean;
  date: string;
  daily?: string;
  periods: { period: string; users: number; pageViews: number }[];
}

export async function handleCronAnalytics(
  env: Env,
): Promise<CronAnalyticsResult> {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  // 1) 4 period 데이터 병렬 수집 + D1 UPSERT (PK = date+period)
  const periodResults = await Promise.all(
    PERIODS.map(async (p) => {
      const data = await reportSet(env, p.startDate, "today");
      return { period: p.label, ...data };
    }),
  );
  for (const pr of periodResults) {
    await upsertPeriod(env, today, pr.period, pr);
  }

  // 2) 어제 daily 스냅샷 (이미 있으면 스킵)
  const existing = await env.DB.prepare(
    `SELECT 1 FROM analytics_daily WHERE date = ? AND period = 'daily' LIMIT 1`,
  )
    .bind(yesterday)
    .first();

  let dailySaved: string | undefined;
  if (!existing) {
    const dailyData = await reportSet(env, yesterday, yesterday);
    await upsertPeriod(env, yesterday, "daily", dailyData, "[]");
    dailySaved = yesterday;
  }

  return {
    ok: true,
    date: today,
    daily: dailySaved,
    periods: periodResults.map((p) => ({
      period: p.period,
      users: p.activeUsers,
      pageViews: p.pageViews,
    })),
  };
}

export async function handleCronAnalyticsHTTP(
  request: Request,
  env: Env,
): Promise<Response> {
  const url = new URL(request.url);
  const secret =
    url.searchParams.get("secret") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!secret || secret !== env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await handleCronAnalytics(env);
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
