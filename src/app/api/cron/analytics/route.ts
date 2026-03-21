import { NextRequest, NextResponse } from "next/server";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

const AIRTABLE_API = "https://api.airtable.com/v0";
const TABLE_ID = "tbl5tWcWKXFuOhQmB";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pat = process.env.AIRTABLE_PAT;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const propertyId = process.env.GA4_PROPERTY_ID;
  const serviceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!pat || !baseId || !propertyId || !serviceEmail || !privateKey) {
    return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
  }

  try {
    const client = new BetaAnalyticsDataClient({
      credentials: { client_email: serviceEmail, private_key: privateKey },
    });

    const property = `properties/${propertyId}`;

    // 여러 기간 동시 조회
    const periods = [
      { label: "7d", startDate: "7daysAgo" },
      { label: "14d", startDate: "14daysAgo" },
      { label: "30d", startDate: "30daysAgo" },
      { label: "90d", startDate: "90daysAgo" },
    ];

    const results = [];

    for (const period of periods) {
      // 기본 메트릭
      const [metricsReport] = await client.runReport({
        property,
        dateRanges: [{ startDate: period.startDate, endDate: "today" }],
        metrics: [
          { name: "activeUsers" },
          { name: "screenPageViews" },
          { name: "averageSessionDuration" },
          { name: "bounceRate" },
        ],
      });

      const mv = metricsReport.rows?.[0]?.metricValues || [];

      // 인기 페이지
      const [pagesReport] = await client.runReport({
        property,
        dateRanges: [{ startDate: period.startDate, endDate: "today" }],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 10,
      });

      const topPages = (pagesReport.rows || []).map((r) => ({
        path: r.dimensionValues?.[0]?.value,
        views: Number(r.metricValues?.[0]?.value),
      }));

      // 트래픽 소스
      const [sourceReport] = await client.runReport({
        property,
        dateRanges: [{ startDate: period.startDate, endDate: "today" }],
        dimensions: [{ name: "sessionDefaultChannelGroup" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 10,
      });

      const trafficSources = (sourceReport.rows || []).map((r) => ({
        name: r.dimensionValues?.[0]?.value,
        sessions: Number(r.metricValues?.[0]?.value),
      }));

      // 기기별
      const [deviceReport] = await client.runReport({
        property,
        dateRanges: [{ startDate: period.startDate, endDate: "today" }],
        dimensions: [{ name: "deviceCategory" }],
        metrics: [{ name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      });

      const devices = (deviceReport.rows || []).map((r) => ({
        name: r.dimensionValues?.[0]?.value,
        users: Number(r.metricValues?.[0]?.value),
      }));

      // 유입 경로
      const [refReport] = await client.runReport({
        property,
        dateRanges: [{ startDate: period.startDate, endDate: "today" }],
        dimensions: [{ name: "sessionSource" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 10,
      });

      const referrers = (refReport.rows || []).map((r) => ({
        name: r.dimensionValues?.[0]?.value,
        sessions: Number(r.metricValues?.[0]?.value),
      }));

      // 일별 트렌드
      const [trendReport] = await client.runReport({
        property,
        dateRanges: [{ startDate: period.startDate, endDate: "today" }],
        dimensions: [{ name: "date" }],
        metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
        orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
      });

      const dailyTrend = (trendReport.rows || []).map((r) => ({
        date: r.dimensionValues?.[0]?.value,
        users: Number(r.metricValues?.[0]?.value),
        pageViews: Number(r.metricValues?.[1]?.value),
      }));

      results.push({
        fields: {
          date: new Date().toISOString().split("T")[0],
          period: period.label,
          activeUsers: Number(mv[0]?.value || 0),
          pageViews: Number(mv[1]?.value || 0),
          avgDuration: Number(Number(mv[2]?.value || 0).toFixed(1)),
          bounceRate: Number(Number(mv[3]?.value || 0).toFixed(4)),
          topPages: JSON.stringify(topPages),
          trafficSources: JSON.stringify(trafficSources),
          devices: JSON.stringify(devices),
          referrers: JSON.stringify(referrers),
          dailyTrend: JSON.stringify(dailyTrend),
        },
      });
    }

    // 기존 오늘 데이터 삭제 (중복 방지)
    const today = new Date().toISOString().split("T")[0];
    const existing = await fetch(
      `${AIRTABLE_API}/${baseId}/${TABLE_ID}?filterByFormula={date}="${today}"`,
      { headers: { Authorization: `Bearer ${pat}` } },
    ).then((r) => r.json());

    if (existing.records?.length) {
      const ids = existing.records.map((r: { id: string }) => r.id);
      for (let i = 0; i < ids.length; i += 10) {
        const batch = ids.slice(i, i + 10);
        const params = batch.map((id: string) => `records[]=${id}`).join("&");
        await fetch(`${AIRTABLE_API}/${baseId}/${TABLE_ID}?${params}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${pat}` },
        });
      }
    }

    // 새 데이터 삽입
    for (let i = 0; i < results.length; i += 10) {
      const batch = results.slice(i, i + 10);
      await fetch(`${AIRTABLE_API}/${baseId}/${TABLE_ID}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${pat}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ records: batch }),
      });
    }

    return NextResponse.json({
      ok: true,
      date: today,
      periods: results.map((r) => ({
        period: r.fields.period,
        users: r.fields.activeUsers,
        pageViews: r.fields.pageViews,
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
