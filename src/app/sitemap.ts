import type { MetadataRoute } from "next";

const BASE = "https://jsbizfunding.kr";
const AIRTABLE_API = "https://api.airtable.com/v0";
const TABLE_ID = "tblqm10vZyVADXMKQ";

async function fetchNoticeIds(): Promise<Array<{ id: string; date: string }>> {
  const pat = process.env.AIRTABLE_PAT;
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!pat || !baseId) return [];

  const items: Array<{ id: string; date: string }> = [];
  let offset: string | undefined;

  try {
    do {
      const params = new URLSearchParams({
        "fields[]": "pblancId",
        "fields[]2": "publishDate",
        pageSize: "100",
        filterByFormula: `OR({status}="리라이팅완료",{status}="게시중")`,
      });
      // Airtable needs separate fields[] params
      const url = `${AIRTABLE_API}/${baseId}/${TABLE_ID}?fields%5B%5D=pblancId&fields%5B%5D=publishDate&pageSize=100&filterByFormula=OR(%7Bstatus%7D%3D%22%EB%A6%AC%EB%9D%BC%EC%9D%B4%ED%8C%85%EC%99%84%EB%A3%8C%22%2C%7Bstatus%7D%3D%22%EA%B2%8C%EC%8B%9C%EC%A4%91%22)${offset ? `&offset=${offset}` : ""}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${pat}` },
        next: { revalidate: 3600 },
      });
      if (!res.ok) break;
      const data = await res.json();
      for (const r of data.records || []) {
        const f = r.fields || {};
        if (f.pblancId) {
          items.push({
            id: f.pblancId,
            date: f.publishDate || new Date().toISOString().slice(0, 10),
          });
        }
      }
      offset = data.offset;
    } while (offset);
  } catch {
    // sitemap 생성 실패 시 정적 페이지만 반환
  }

  return items;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  const staticPages: MetadataRoute.Sitemap = [
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
      url: `${BASE}/notice`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE}/diagnosis`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
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

  const notices = await fetchNoticeIds();
  const noticePages: MetadataRoute.Sitemap = notices.map((n) => ({
    url: `${BASE}/notice/${n.id}`,
    lastModified: n.date,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...noticePages];
}
