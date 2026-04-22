/**
 * Airtable 공고 데이터 서버 fetch 유틸.
 * 서버 컴포넌트/generateMetadata/sitemap 등에서 직접 호출.
 */

const AIRTABLE_API = "https://api.airtable.com/v0";
const TABLE_ID = "tblqm10vZyVADXMKQ";

export interface NoticeItem {
  id: string;
  pblancId: string;
  title: string;
  originalTitle: string;
  summary: string;
  contentUrl: string;
  category: string;
  source: string;
  applyPeriod: string;
  originalUrl: string;
  publishDate: string;
  status: string;
  tags: string;
}

export interface NoticeListResult {
  records: NoticeItem[];
  offset: string | null;
}

interface FetchNoticesOptions {
  limit?: number;
  category?: string;
  exclude?: string[];
  offset?: string;
  /** Next.js revalidate 초 단위 (기본 300 = 5분) */
  revalidate?: number;
}

function buildFilter({
  category,
  exclude,
}: {
  category?: string;
  exclude?: string[];
}): string {
  const filters = [`OR({status}="리라이팅완료",{status}="게시중")`];
  if (category) {
    filters.push(`{category}="${category}"`);
  } else {
    filters.push(`{category}!="인스타"`);
  }
  if (exclude && exclude.length) {
    exclude.forEach((c) => filters.push(`{category}!="${c}"`));
  }
  return filters.length > 1 ? `AND(${filters.join(",")})` : filters[0];
}

export async function fetchNotices(
  options: FetchNoticesOptions = {},
): Promise<NoticeListResult> {
  const pat = process.env.AIRTABLE_PAT;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!pat || !baseId) {
    return { records: [], offset: null };
  }

  const { limit = 20, category, exclude, offset, revalidate = 300 } = options;

  const params = new URLSearchParams();
  params.set("filterByFormula", buildFilter({ category, exclude }));
  params.set("pageSize", String(limit));
  params.set("sort[0][field]", "publishDate");
  params.set("sort[0][direction]", "desc");
  if (offset) params.set("offset", offset);

  const url = `${AIRTABLE_API}/${baseId}/${TABLE_ID}?${params.toString()}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${pat}` },
      next: { revalidate },
    });
    if (!res.ok) {
      return { records: [], offset: null };
    }
    const data = await res.json();
    const records: NoticeItem[] = (data.records || []).map(
      (r: { id: string; fields: Record<string, unknown> }) => ({
        id: r.id,
        ...(r.fields as Omit<NoticeItem, "id">),
      }),
    );
    return { records, offset: data.offset || null };
  } catch {
    return { records: [], offset: null };
  }
}

export async function fetchNoticeContent<T = unknown>(
  contentUrl: string | null | undefined,
  revalidate = 300,
): Promise<T | null> {
  if (!contentUrl) return null;
  const allowedPrefix = process.env.R2_PUBLIC_URL || "https://pub-";
  if (!contentUrl.startsWith(allowedPrefix)) return null;
  try {
    const res = await fetch(contentUrl, { next: { revalidate } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchNoticeById(
  pblancId: string,
  revalidate = 300,
): Promise<NoticeItem | null> {
  const pat = process.env.AIRTABLE_PAT;
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!pat || !baseId) return null;

  const params = new URLSearchParams();
  params.set("filterByFormula", `{pblancId}="${pblancId}"`);
  params.set("maxRecords", "1");

  const url = `${AIRTABLE_API}/${baseId}/${TABLE_ID}?${params.toString()}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${pat}` },
      next: { revalidate },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const record = (data.records || [])[0];
    if (!record) return null;
    return { id: record.id, ...(record.fields as Omit<NoticeItem, "id">) };
  } catch {
    return null;
  }
}
