import { NextRequest, NextResponse } from "next/server";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

const AIRTABLE_API = "https://api.airtable.com/v0";
const TABLE_ID = "tbl5tWcWKXFuOhQmB";

function getGA4Client() {
  const serviceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!serviceEmail || !privateKey) return null;
  return new BetaAnalyticsDataClient({
    credentials: { client_email: serviceEmail, private_key: privateKey },
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode"); // "realtime" | "custom" | default (cached)

  // === 실시간 접속자 ===
  if (mode === "realtime") {
    const client = getGA4Client();
    const propertyId = process.env.GA4_PROPERTY_ID;
    if (!client || !propertyId) {
      return NextResponse.json(
        { error: "GA4 not configured" },
        { status: 500 },
      );
    }
    try {
      const [report] = await client.runRealtimeReport({
        property: `properties/${propertyId}`,
        metrics: [{ name: "activeUsers" }],
      });
      const activeUsers = Number(
        report.rows?.[0]?.metricValues?.[0]?.value || 0,
      );
      return NextResponse.json({
        activeUsers,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      return NextResponse.json(
        { error: (err as Error).message, activeUsers: 0 },
        { status: 500 },
      );
    }
  }

  // === 사용자 지정 기간 (GA4 직접 조회) ===
  if (mode === "custom") {
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate, endDate required" },
        { status: 400 },
      );
    }
    const client = getGA4Client();
    const propertyId = process.env.GA4_PROPERTY_ID;
    if (!client || !propertyId) {
      return NextResponse.json(
        { error: "GA4 not configured" },
        { status: 500 },
      );
    }
    const property = `properties/${propertyId}`;
    try {
      const [metrics] = await client.runReport({
        property,
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: "activeUsers" },
          { name: "screenPageViews" },
          { name: "averageSessionDuration" },
          { name: "bounceRate" },
        ],
      });
      const mv = metrics.rows?.[0]?.metricValues || [];

      const [pages] = await client.runReport({
        property,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 10,
      });

      const [sources] = await client.runReport({
        property,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "sessionDefaultChannelGroup" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 10,
      });

      const [devices] = await client.runReport({
        property,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "deviceCategory" }],
        metrics: [{ name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      });

      const [refs] = await client.runReport({
        property,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "sessionSource" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 10,
      });

      const [trend] = await client.runReport({
        property,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "date" }],
        metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
        orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
      });

      return NextResponse.json({
        date: new Date().toISOString().split("T")[0],
        period: "custom",
        activeUsers: Number(mv[0]?.value || 0),
        pageViews: Number(mv[1]?.value || 0),
        avgDuration: Number(Number(mv[2]?.value || 0).toFixed(1)),
        bounceRate: Number(Number(mv[3]?.value || 0).toFixed(4)),
        topPages: (pages.rows || []).map((r) => ({
          path: r.dimensionValues?.[0]?.value,
          views: Number(r.metricValues?.[0]?.value),
        })),
        trafficSources: (sources.rows || []).map((r) => ({
          name: r.dimensionValues?.[0]?.value,
          sessions: Number(r.metricValues?.[0]?.value),
        })),
        devices: (devices.rows || []).map((r) => ({
          name: r.dimensionValues?.[0]?.value,
          users: Number(r.metricValues?.[0]?.value),
        })),
        referrers: (refs.rows || []).map((r) => ({
          name: r.dimensionValues?.[0]?.value,
          sessions: Number(r.metricValues?.[0]?.value),
        })),
        dailyTrend: (trend.rows || []).map((r) => ({
          date: r.dimensionValues?.[0]?.value,
          users: Number(r.metricValues?.[0]?.value),
          pageViews: Number(r.metricValues?.[1]?.value),
        })),
      });
    } catch (err) {
      return NextResponse.json(
        { error: (err as Error).message },
        { status: 500 },
      );
    }
  }

  // === 캐시 데이터 (Airtable) ===
  const pat = process.env.AIRTABLE_PAT;
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!pat || !baseId) {
    return NextResponse.json({ error: "Missing env" }, { status: 500 });
  }

  const period = searchParams.get("period") || "7d";
  const url = `${AIRTABLE_API}/${baseId}/${TABLE_ID}?filterByFormula={period}="${period}"&sort[0][field]=date&sort[0][direction]=desc&maxRecords=1`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${pat}` },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Airtable error" }, { status: 500 });
  }

  const data = await res.json();
  const record = data.records?.[0]?.fields;

  if (!record) {
    return NextResponse.json(
      { error: "No data", hint: "Run cron first" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    date: record.date,
    period: record.period,
    activeUsers: record.activeUsers,
    pageViews: record.pageViews,
    avgDuration: record.avgDuration,
    bounceRate: record.bounceRate,
    topPages: JSON.parse(record.topPages || "[]"),
    trafficSources: JSON.parse(record.trafficSources || "[]"),
    devices: JSON.parse(record.devices || "[]"),
    referrers: JSON.parse(record.referrers || "[]"),
    dailyTrend: JSON.parse(record.dailyTrend || "[]"),
  });
}
