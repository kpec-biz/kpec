import { NextRequest, NextResponse } from "next/server";

const AIRTABLE_API = "https://api.airtable.com/v0";
const TABLE_ID = "tbl5tWcWKXFuOhQmB";

export async function GET(req: NextRequest) {
  const pat = process.env.AIRTABLE_PAT;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!pat || !baseId) {
    return NextResponse.json({ error: "Missing env" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "7d";

  // 최신 데이터 1건 (해당 period)
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

  // JSON 필드 파싱
  const parsed = {
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
  };

  return NextResponse.json(parsed);
}
