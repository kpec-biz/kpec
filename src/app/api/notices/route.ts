import { NextRequest, NextResponse } from "next/server";

const WORKER_URL =
  process.env.NEXT_PUBLIC_WORKER_URL || "https://kpec.kjs010zzz.workers.dev";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // 단건 조회 (?id=PBLN_xxx) → Worker /api/notices/{pblancId}
    if (id) {
      const res = await fetch(
        `${WORKER_URL}/api/notices/${encodeURIComponent(id)}`,
        { next: { revalidate: 300 } },
      );
      if (!res.ok) {
        return NextResponse.json(
          { error: "공고 데이터를 불러오지 못했습니다." },
          { status: res.status },
        );
      }
      const data = await res.json();
      return NextResponse.json({
        records: data.records || [],
        total: data.total ?? (data.records?.length || 0),
      });
    }

    // 목록 조회 → Worker /api/notices?limit=&category=&exclude=&offset=&popup=
    const qs = new URLSearchParams();
    const passThrough = ["limit", "category", "exclude", "offset", "popup"];
    for (const key of passThrough) {
      const v = searchParams.get(key);
      if (v != null) qs.set(key, v);
    }
    if (!qs.has("limit")) qs.set("limit", "20");

    const res = await fetch(`${WORKER_URL}/api/notices?${qs.toString()}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: "공고 데이터를 불러오지 못했습니다." },
        { status: res.status },
      );
    }
    const data = await res.json();
    return NextResponse.json({
      records: data.records || [],
      total: data.total ?? (data.records?.length || 0),
      ...(data.offset ? { offset: data.offset } : {}),
    });
  } catch {
    return NextResponse.json(
      { error: "공고 데이터를 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}
