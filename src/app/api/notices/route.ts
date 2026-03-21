import { NextRequest, NextResponse } from "next/server";

const AIRTABLE_API = "https://api.airtable.com/v0";
const TABLE_ID = "tblqm10vZyVADXMKQ";

export async function GET(req: NextRequest) {
  try {
    const pat = process.env.AIRTABLE_PAT;
    const baseId = process.env.AIRTABLE_BASE_ID;

    if (!pat || !baseId) {
      return NextResponse.json(
        { error: "Airtable 설정이 없습니다." },
        { status: 500 },
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "리라이팅완료";
    const limit = searchParams.get("limit") || "20";
    const id = searchParams.get("id"); // 단일 조회

    let url = `${AIRTABLE_API}/${baseId}/${TABLE_ID}`;
    const params = new URLSearchParams();

    if (id) {
      // pblancId로 단일 조회
      params.set("filterByFormula", `{pblancId}="${id}"`);
      params.set("maxRecords", "1");
    } else {
      params.set(
        "filterByFormula",
        `OR({status}="${status}",{status}="게시중")`,
      );
      params.set("maxRecords", limit);
      params.set("sort[0][field]", "publishDate");
      params.set("sort[0][direction]", "desc");
    }

    url += `?${params.toString()}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${pat}` },
      next: { revalidate: 300 }, // 5분 캐시
    });

    if (!res.ok) {
      throw new Error(`Airtable error: ${res.status}`);
    }

    const data = await res.json();
    const records = (data.records || []).map(
      (r: { id: string; fields: Record<string, unknown> }) => ({
        id: r.id,
        ...r.fields,
      }),
    );

    return NextResponse.json({ records, total: records.length });
  } catch {
    return NextResponse.json(
      { error: "공고 데이터를 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}
