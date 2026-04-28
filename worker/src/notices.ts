import { Env } from "./airtable";

/**
 * D1 row → frontend가 기대하는 NoticeItem (camelCase) 변환.
 * 호환성: id 필드는 기존 Airtable record id (rec...) 형식을 유지하기 위해 airtable_id 우선,
 * 새로 D1에서만 생성된 row는 D1 정수 id를 문자열로 노출.
 */
interface D1NoticeRow {
  id: number;
  pblanc_id: string;
  airtable_id: string | null;
  title: string;
  original_title: string | null;
  summary: string | null;
  content_url: string | null;
  category: string;
  source: string | null;
  apply_period: string | null;
  original_url: string | null;
  publish_date: string | null;
  status: string;
  tags: string | null;
}

function toItem(row: D1NoticeRow) {
  return {
    id: row.airtable_id || String(row.id),
    pblancId: row.pblanc_id,
    title: row.title,
    originalTitle: row.original_title || "",
    summary: row.summary || "",
    contentUrl: row.content_url || "",
    category: row.category,
    source: row.source || "",
    applyPeriod: row.apply_period || "",
    originalUrl: row.original_url || "",
    publishDate: row.publish_date || "",
    status: row.status,
    tags: row.tags || "",
  };
}

const PUBLIC_STATUSES = ["리라이팅완료", "게시중"];

export async function handleNoticesList(
  request: Request,
  env: Env,
): Promise<Response> {
  const url = new URL(request.url);
  const params = url.searchParams;

  const limit = Math.min(Number(params.get("limit") || "20") || 20, 100);
  const offset = Math.max(Number(params.get("offset") || "0") || 0, 0);
  const category = params.get("category");
  const exclude = params.get("exclude");
  const popup = params.get("popup") === "true";

  const where: string[] = [];
  const binds: unknown[] = [];

  if (popup) {
    where.push(`status = ?`);
    binds.push("팝업");
  } else {
    where.push(`status IN (${PUBLIC_STATUSES.map(() => "?").join(",")})`);
    binds.push(...PUBLIC_STATUSES);

    if (category) {
      where.push(`category = ?`);
      binds.push(category);
    } else {
      // 기본: 인스타 제외 (인스타는 명시 조회만)
      where.push(`category != ?`);
      binds.push("인스타");
    }
    if (exclude) {
      const cats = exclude
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      for (const c of cats) {
        where.push(`category != ?`);
        binds.push(c);
      }
    }
  }

  const sql =
    `SELECT id, pblanc_id, airtable_id, title, original_title, summary, ` +
    `content_url, category, source, apply_period, original_url, ` +
    `publish_date, status, tags ` +
    `FROM notices WHERE ${where.join(" AND ")} ` +
    `ORDER BY publish_date DESC, id DESC ` +
    `LIMIT ? OFFSET ?`;
  const finalBinds = popup
    ? [...binds, 1, 0] // popup은 1건만
    : [...binds, limit, offset];

  const result = await env.DB.prepare(sql)
    .bind(...finalBinds)
    .all<D1NoticeRow>();

  const records = (result.results || []).map(toItem);

  // 다음 페이지 offset 계산
  // popup이거나 limit 미만이면 더 이상 페이지 없음
  const nextOffset =
    !popup && records.length === limit ? String(offset + limit) : null;

  return Response.json({
    records,
    total: records.length,
    ...(nextOffset ? { offset: nextOffset } : {}),
  });
}

export async function handleNoticeById(
  pblancId: string,
  env: Env,
): Promise<Response> {
  const sql =
    `SELECT id, pblanc_id, airtable_id, title, original_title, summary, ` +
    `content_url, category, source, apply_period, original_url, ` +
    `publish_date, status, tags ` +
    `FROM notices WHERE pblanc_id = ? LIMIT 1`;

  const row = await env.DB.prepare(sql).bind(pblancId).first<D1NoticeRow>();
  if (!row) {
    return Response.json({ records: [], total: 0 }, { status: 200 });
  }
  return Response.json({ records: [toItem(row)], total: 1 });
}
