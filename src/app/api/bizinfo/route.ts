import { NextRequest, NextResponse } from "next/server";

const BIZINFO_API_URL = "https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "1";
    const size = searchParams.get("size") || "10";

    const apiKey = process.env.BIZINFO_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API 키가 설정되지 않았습니다." },
        { status: 500 },
      );
    }

    const response = await fetch(
      `${BIZINFO_API_URL}?crtfcKey=${apiKey}&dataType=json&pageUnit=${size}&pageIndex=${page}`,
      // 하루 1번 캐시 (86400초 = 24시간)
      { next: { revalidate: 86400 } },
    );

    if (!response.ok) {
      throw new Error(`Bizinfo API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "정책자금 공고를 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}
