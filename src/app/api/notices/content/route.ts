import { NextRequest, NextResponse } from "next/server";

// R2 본문 JSON을 서버에서 fetch하여 CORS 우회
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url || !url.startsWith(process.env.R2_PUBLIC_URL || "https://pub-")) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      next: { revalidate: 300 }, // 5분 캐시
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 },
    );
  }
}
