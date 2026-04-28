/**
 * KPEC 콘텐츠(공고/뉴스/분석/인스타) fetch 유틸.
 * 백엔드: Cloudflare Worker `/api/notices` (D1 SoT)
 * 서버 컴포넌트/generateMetadata/sitemap/route handler에서 직접 호출.
 */

const WORKER_URL =
  process.env.NEXT_PUBLIC_WORKER_URL || "https://kpec.kjs010zzz.workers.dev";

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

export async function fetchNotices(
  options: FetchNoticesOptions = {},
): Promise<NoticeListResult> {
  const { limit = 20, category, exclude, offset, revalidate = 300 } = options;

  const params = new URLSearchParams();
  params.set("limit", String(limit));
  if (category) params.set("category", category);
  if (exclude && exclude.length) params.set("exclude", exclude.join(","));
  if (offset) params.set("offset", offset);

  try {
    const res = await fetch(`${WORKER_URL}/api/notices?${params.toString()}`, {
      next: { revalidate },
    });
    if (!res.ok) return { records: [], offset: null };
    const data = await res.json();
    return {
      records: (data.records || []) as NoticeItem[],
      offset: (data.offset as string | undefined) || null,
    };
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
  try {
    const res = await fetch(
      `${WORKER_URL}/api/notices/${encodeURIComponent(pblancId)}`,
      { next: { revalidate } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const record = (data.records || [])[0] as NoticeItem | undefined;
    return record || null;
  } catch {
    return null;
  }
}
