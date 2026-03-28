import type { Metadata } from "next";
import { BreadcrumbJsonLd, ArticleJsonLd } from "@/lib/seo";

const AIRTABLE_API = "https://api.airtable.com/v0";
const TABLE_ID = "tblqm10vZyVADXMKQ";

async function fetchNotice(id: string) {
  const pat = process.env.AIRTABLE_PAT;
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!pat || !baseId) return null;

  try {
    const filter = encodeURIComponent(`{pblancId}="${id}"`);
    const res = await fetch(
      `${AIRTABLE_API}/${baseId}/${TABLE_ID}?filterByFormula=${filter}&maxRecords=1`,
      {
        headers: { Authorization: `Bearer ${pat}` },
        next: { revalidate: 300 },
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.records?.[0]?.fields || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const notice = await fetchNotice(id);

  if (!notice) {
    return { title: "알림·자료" };
  }

  const title = notice.title || "정책자금 공고";
  const description =
    notice.summary ||
    "기업정책자금센터에서 제공하는 정책자금 공고 상세 정보입니다.";

  return {
    title,
    description: description.slice(0, 160),
    alternates: { canonical: `https://jsbizfunding.kr/notice/${id}` },
    openGraph: {
      title,
      description: description.slice(0, 160),
      url: `https://jsbizfunding.kr/notice/${id}`,
      type: "article",
      ...(notice.originalUrl?.startsWith("http")
        ? { images: [notice.originalUrl] }
        : {}),
    },
  };
}

export default async function NoticeDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const notice = await fetchNotice(id);

  const title = notice?.title || "공고 상세";
  const category =
    notice?.category === "뉴스"
      ? "정책자금 뉴스"
      : notice?.category === "분석"
        ? "정책자금 분석"
        : "정책자금 공고";

  return (
    <>
      <BreadcrumbJsonLd
        items={[{ name: "알림·자료", href: "/notice" }, { name: title }]}
      />
      {notice && (
        <ArticleJsonLd
          headline={title}
          description={notice.summary || ""}
          datePublished={
            notice.publishDate || new Date().toISOString().slice(0, 10)
          }
          image={
            notice.originalUrl?.startsWith("http")
              ? notice.originalUrl
              : undefined
          }
        />
      )}
      {children}
    </>
  );
}
