import type { MetadataRoute } from "next";
import { fetchNotices } from "@/lib/notices";

const BASE = "https://jsbizfunding.kr";

// 공고 상세는 최근 30건만 포함 (한 번에 대량 추가 시 Google이 크롤링을 보류하는 문제 방지)
const NOTICE_DETAIL_LIMIT = 30;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: BASE,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE}/services`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE}/notice`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE}/process`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/cases`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE}/diagnosis`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // 최근 공고 상세 (Airtable에서 최신 30건)
  let noticeEntries: MetadataRoute.Sitemap = [];
  try {
    const { records } = await fetchNotices({
      limit: NOTICE_DETAIL_LIMIT,
      revalidate: 3600, // 1시간 캐시
    });
    noticeEntries = records
      .filter((r) => r.pblancId)
      .map((r) => ({
        url: `${BASE}/notice/${r.pblancId}`,
        lastModified: r.publishDate
          ? new Date(r.publishDate).toISOString()
          : now,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
  } catch {
    noticeEntries = [];
  }

  return [...staticEntries, ...noticeEntries];
}
