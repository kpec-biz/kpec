import { Env } from "./airtable";

// CF Worker IP가 GA4 anti-abuse에 차단되어 GA4 직접 호출 시 HTML "Sorry..." 페이지를
// 반환하는 사례가 매일 발생. GA4 호출만 Vercel /api/analytics?mode=daily-snapshot |
// period-users 로 위임. cron 스케줄과 D1 read/write는 Worker가 담당.

const VERCEL_API = "https://jsbizfunding.kr";

const PERIODS = [
  { label: "7d", days: 7 },
  { label: "14d", days: 14 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
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

interface DailyD1Row {
  date: string;
  active_users: number;
  page_views: number;
  avg_duration: number;
  bounce_rate: number;
  top_pages: string | null;
  traffic_sources: string | null;
  devices: string | null;
  referrers: string | null;
  regions: string | null;
}

interface DailySnapshotResponse {
  date: string;
  activeUsers: number;
  pageViews: number;
  avgDuration: number;
  bounceRate: number;
  topPages: { path?: string; views: number }[];
  trafficSources: { name?: string; sessions: number }[];
  devices: { name?: string; users: number }[];
  referrers: { name?: string; sessions: number }[];
  regions: { name?: string; users: number }[];
}

async function vercelGet<T>(path: string, env: Env): Promise<T> {
  const url = new URL(path, VERCEL_API);
  // CRON_SECRET을 query secret과 Authorization 둘 다 첨부 (Vercel route 양쪽 다 수용)
  url.searchParams.set("secret", env.CRON_SECRET);
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${env.CRON_SECRET}` },
  });
  if (!res.ok) {
    throw new Error(
      `Vercel ${path}: ${res.status} ${(await res.text()).slice(0, 200)}`,
    );
  }
  return res.json() as Promise<T>;
}

async function fetchDailySnapshot(
  env: Env,
  date: string,
): Promise<PeriodReport> {
  const data = await vercelGet<DailySnapshotResponse>(
    `/api/analytics?mode=daily-snapshot&date=${date}`,
    env,
  );
  return {
    activeUsers: data.activeUsers,
    pageViews: data.pageViews,
    avgDuration: data.avgDuration,
    bounceRate: data.bounceRate,
    topPages: data.topPages,
    trafficSources: data.trafficSources,
    devices: data.devices,
    referrers: data.referrers,
    regions: data.regions,
    dailyTrend: [], // 1일점 → "[]"로 저장
  };
}

async function fetchPeriodUniqueUsers(env: Env): Promise<Map<string, number>> {
  const data = await vercelGet<Record<string, number>>(
    `/api/analytics?mode=period-users`,
    env,
  );
  const out = new Map<string, number>();
  for (const p of PERIODS) {
    if (typeof data[p.label] === "number") out.set(p.label, data[p.label]);
  }
  return out;
}

async function aggregatePeriodFromD1(
  env: Env,
  endDate: string,
  days: number,
): Promise<PeriodReport | null> {
  const result = await env.DB.prepare(
    `SELECT date, active_users, page_views, avg_duration, bounce_rate,
            top_pages, traffic_sources, devices, referrers, regions
     FROM analytics_daily
     WHERE period = 'daily' AND date <= ?
     ORDER BY date DESC LIMIT ?`,
  )
    .bind(endDate, days)
    .all<DailyD1Row>();

  const rows = result.results || [];
  if (rows.length === 0) return null;

  let totalUsers = 0;
  let totalPV = 0;
  let weightedDuration = 0;
  let weightedBounce = 0;
  let weight = 0;

  const pages = new Map<string, number>();
  const sources = new Map<string, number>();
  const devices = new Map<string, number>();
  const refs = new Map<string, number>();
  const regions = new Map<string, number>();
  const trend: { date: string; users: number; pageViews: number }[] = [];

  const tryParse = <T>(s: string | null): T[] => {
    if (!s) return [];
    try {
      const v = JSON.parse(s);
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  };
  const accum = (
    map: Map<string, number>,
    items: {
      name?: string;
      path?: string;
      views?: number;
      sessions?: number;
      users?: number;
    }[],
  ) => {
    for (const it of items) {
      const k = it.name ?? it.path ?? "";
      if (!k) continue;
      const v = it.views ?? it.sessions ?? it.users ?? 0;
      map.set(k, (map.get(k) || 0) + v);
    }
  };

  for (const r of rows) {
    totalUsers += r.active_users;
    totalPV += r.page_views;
    if (r.page_views > 0) {
      weightedDuration += (r.avg_duration || 0) * r.page_views;
      weightedBounce += (r.bounce_rate || 0) * r.page_views;
      weight += r.page_views;
    }
    accum(pages, tryParse(r.top_pages));
    accum(sources, tryParse(r.traffic_sources));
    accum(devices, tryParse(r.devices));
    accum(refs, tryParse(r.referrers));
    accum(regions, tryParse(r.regions));
    trend.unshift({
      date: r.date.replace(/-/g, ""),
      users: r.active_users,
      pageViews: r.page_views,
    });
  }

  const sortLimit = (m: Map<string, number>, n: number) =>
    Array.from(m.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, n);

  return {
    activeUsers: totalUsers, // 호출자가 GA4 정확값으로 덮어씀
    pageViews: totalPV,
    avgDuration:
      weight > 0 ? Number((weightedDuration / weight).toFixed(1)) : 0,
    bounceRate: weight > 0 ? Number((weightedBounce / weight).toFixed(4)) : 0,
    topPages: sortLimit(pages, 10).map(([k, v]) => ({ path: k, views: v })),
    trafficSources: sortLimit(sources, 10).map(([k, v]) => ({
      name: k,
      sessions: v,
    })),
    devices: sortLimit(devices, 5).map(([k, v]) => ({ name: k, users: v })),
    referrers: sortLimit(refs, 10).map(([k, v]) => ({ name: k, sessions: v })),
    dailyTrend: trend,
    regions: sortLimit(regions, 10).map(([k, v]) => ({ name: k, users: v })),
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
  periods: { period: string; users: number; pageViews: number; days: number }[];
}

export async function handleCronAnalytics(
  env: Env,
): Promise<CronAnalyticsResult> {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  // 1) 어제 daily 스냅샷이 D1에 없으면 Vercel 경유 GA4 fetch (idempotent)
  const existingDaily = await env.DB.prepare(
    `SELECT 1 FROM analytics_daily WHERE date = ? AND period = 'daily' LIMIT 1`,
  )
    .bind(yesterday)
    .first();

  let dailySaved: string | undefined;
  if (!existingDaily) {
    const dailyData = await fetchDailySnapshot(env, yesterday);
    await upsertPeriod(env, yesterday, "daily", dailyData, "[]");
    dailySaved = yesterday;
  }

  // 2) 4 period 정확한 unique activeUsers를 Vercel 경유 GA4 1회 호출로 가져옴
  const periodUsers = await fetchPeriodUniqueUsers(env);

  // 3) 각 period는 D1 daily 누적치에서 합산/가중평균. activeUsers만 GA4 정확값으로 덮어씀
  const periodResults: CronAnalyticsResult["periods"] = [];
  for (const p of PERIODS) {
    const agg = await aggregatePeriodFromD1(env, yesterday, p.days);
    if (!agg) continue;
    const accurateUsers = periodUsers.get(p.label);
    if (typeof accurateUsers === "number") {
      agg.activeUsers = accurateUsers;
    }
    await upsertPeriod(env, today, p.label, agg);
    periodResults.push({
      period: p.label,
      users: agg.activeUsers,
      pageViews: agg.pageViews,
      days: p.days,
    });
  }

  return {
    ok: true,
    date: today,
    daily: dailySaved,
    periods: periodResults,
  };
}

// 1회용 backfill: D1에 빠진 daily들을 Vercel 경유로 직렬로 채움.
// CF Workers Free tier subrequest 50/invocation 한도 → 한 번에 max 15일.
async function handleBackfill(
  env: Env,
  days: number,
  max: number,
): Promise<{
  ok: boolean;
  filled: string[];
  errors: string[];
  remaining: number;
  total_missing: number;
}> {
  const targets: string[] = [];
  for (let i = 1; i <= days; i++) {
    targets.push(
      new Date(Date.now() - i * 86400000).toISOString().split("T")[0],
    );
  }
  const placeholders = targets.map(() => "?").join(",");
  const existing = await env.DB.prepare(
    `SELECT date FROM analytics_daily WHERE period = 'daily' AND date IN (${placeholders})`,
  )
    .bind(...targets)
    .all<{ date: string }>();
  const have = new Set((existing.results || []).map((r) => r.date));
  const missing = targets.filter((d) => !have.has(d));
  const todo = missing.slice(0, max);

  const filled: string[] = [];
  const errors: string[] = [];
  for (const date of todo) {
    try {
      const data = await fetchDailySnapshot(env, date);
      await upsertPeriod(env, date, "daily", data, "[]");
      filled.push(date);
    } catch (e) {
      errors.push(
        `${date}: ${e instanceof Error ? e.message.slice(0, 100) : "?"}`,
      );
    }
  }

  return {
    ok: errors.length === 0,
    filled,
    errors,
    remaining: missing.length - filled.length,
    total_missing: missing.length,
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
    const backfillDays = Number(url.searchParams.get("backfill") || 0);
    if (backfillDays > 0) {
      const max = Number(url.searchParams.get("max") || 15);
      const result = await handleBackfill(
        env,
        Math.min(backfillDays, 90),
        Math.min(max, 20),
      );
      return Response.json(result);
    }
    const result = await handleCronAnalytics(env);
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
