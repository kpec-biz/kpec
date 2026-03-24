import { NextRequest, NextResponse } from "next/server";

const BIZINFO_API = "https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do";

// Worker에서 호출 — 기업마당 신규 공고 목록만 반환 (리라이팅은 Worker에서 직접)
// 기업마당이 CF IP를 차단하므로 Vercel 경유 필요
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bizinfoKey = process.env.BIZINFO_API_KEY;
  if (!bizinfoKey) {
    return NextResponse.json(
      { error: "Missing BIZINFO_API_KEY" },
      { status: 500 },
    );
  }

  try {
    // 기업마당 최신 20건 가져오기
    const items = [];
    for (let page = 1; page <= 2; page++) {
      const res = await fetch(
        `${BIZINFO_API}?crtfcKey=${bizinfoKey}&dataType=json&pageUnit=10&pageIndex=${page}`,
      );
      if (!res.ok) {
        throw new Error(`bizinfo API error: ${res.status}`);
      }
      const data = await res.json();
      if (data.jsonArray) items.push(...data.jsonArray);
    }

    return NextResponse.json({ items, total: items.length });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
