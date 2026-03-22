import { posts } from "@/data/posts";

const SITE_URL = "https://jsbizfunding.kr";

export async function GET() {
  const sortedPosts = [...posts].sort(
    (a, b) =>
      new Date(b.date.replace(/\./g, "-")).getTime() -
      new Date(a.date.replace(/\./g, "-")).getTime(),
  );

  const escapeXml = (str: string) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  const items = sortedPosts
    .map((post) => {
      const dateStr = post.date.replace(/\./g, "-");
      const pubDate = new Date(dateStr).toUTCString();

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE_URL}/notice/${post.id}</link>
      <description>${escapeXml(post.summary)}</description>
      <pubDate>${pubDate}</pubDate>
      <guid>${SITE_URL}/notice/${post.id}</guid>
      <category>${escapeXml(post.tag)}</category>
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>KPEC 기업정책자금센터</title>
    <link>${SITE_URL}</link>
    <description>중소기업 정책자금 전문 컨설팅. 운전자금·시설자금·기업인증.</description>
    <language>ko</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
