import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import MobileTableCards from "@/components/MobileTableCards";
import {
  fetchNoticeById,
  fetchNoticeContent,
  fetchNotices,
  type NoticeItem,
} from "@/lib/notices";

const SITE_URL = "https://jsbizfunding.kr";

interface ContentBlock {
  type:
    | "h2"
    | "h3"
    | "p"
    | "text"
    | "ul"
    | "info-box"
    | "warn-box"
    | "chart-data"
    | "card";
  text?: string;
  children?: Array<{ text?: string }>;
  items?: string[];
  chartType?: "bar" | "compare" | "table";
  title?: string;
  data?: Array<{ name: string; value: number; color?: string }>;
  headers?: string[];
  rows?: string[][];
  id?: string;
  category?: string;
  target?: string;
  amount?: string;
  deadline?: string;
  summary?: string;
  tags?: string;
}

function blockText(block: ContentBlock): string {
  if (block.text) return block.text;
  if (block.children) return block.children.map((c) => c.text || "").join("");
  return "";
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const notice = await fetchNoticeById(id);

  if (!notice) {
    return {
      title: "공고를 찾을 수 없습니다",
      robots: { index: false, follow: false },
    };
  }

  const isContent = ["뉴스", "분석"].includes(notice.category);
  const descBase =
    notice.summary?.replace(/\s+/g, " ").trim().slice(0, 150) ||
    `${notice.title} ${isContent ? "상세" : "공고"} 정보. 기업정책자금센터.`;

  const ogImage = notice.originalUrl?.includes("r2.dev/thumbnails")
    ? notice.originalUrl
    : `${SITE_URL}/og-image.png`;

  return {
    title: `${notice.title} | ${isContent ? "정책자금 " + notice.category : "정책자금 공고"}`,
    description: descBase,
    alternates: { canonical: `${SITE_URL}/notice/${notice.pblancId}` },
    openGraph: {
      type: "article",
      title: notice.title,
      description: descBase,
      url: `${SITE_URL}/notice/${notice.pblancId}`,
      images: [{ url: ogImage }],
      locale: "ko_KR",
      siteName: "기업정책자금센터",
    },
    twitter: {
      card: "summary_large_image",
      title: notice.title,
      description: descBase,
      images: [ogImage],
    },
  };
}

export default async function NoticeDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [notice, recentRes] = await Promise.all([
    fetchNoticeById(id),
    fetchNotices({ limit: 5, exclude: [] }),
  ]);

  if (!notice) {
    notFound();
  }

  const recentPosts: NoticeItem[] = recentRes.records
    .filter((r) => r.pblancId !== notice.pblancId)
    .slice(0, 3);

  const content = await fetchNoticeContent<ContentBlock[]>(notice.contentUrl);
  const blocks: ContentBlock[] = Array.isArray(content) ? content : [];

  // 접수 상태 판단
  const deadlineStr = notice.applyPeriod?.split("~")[1]?.trim() || "";
  const isAccepting =
    notice.applyPeriod?.includes("상시") ||
    (deadlineStr && new Date(deadlineStr) >= new Date());

  const categoryColor: Record<string, string> = {
    기술: "bg-blue-50 text-blue-600",
    경영: "bg-green-50 text-green-600",
    인력: "bg-orange-50 text-orange-600",
    금융: "bg-purple-50 text-purple-600",
    공고: "bg-primary-5 text-primary-60",
    분석: "bg-point-50/10 text-point-50",
    뉴스: "bg-success/10 text-success",
  };

  const isContent = ["뉴스", "분석"].includes(notice.category);

  // Article JSON-LD (뉴스/분석)
  const articleJsonLd = isContent
    ? {
        "@context": "https://schema.org",
        "@type": notice.category === "뉴스" ? "NewsArticle" : "Article",
        headline: notice.title,
        description: notice.summary,
        datePublished: notice.publishDate,
        author: {
          "@type": "Organization",
          name: "기업정책자금센터",
        },
        publisher: {
          "@type": "Organization",
          name: "기업정책자금센터",
          logo: {
            "@type": "ImageObject",
            url: `${SITE_URL}/og-image.png`,
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${SITE_URL}/notice/${notice.pblancId}`,
        },
      }
    : null;

  return (
    <>
      {articleJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
      )}

      <PageHeader
        bgImage="/images/headers/notice.png"
        title="알림·자료"
        subtitle=""
      />

      <section className="py-12 bg-gray-5">
        <div className="max-w-[1200px] mx-auto px-6">
          {/* 브레드크럼 */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-40 mb-4 sm:mb-5">
            <Link
              href="/"
              className="hover:text-primary-60 transition-colors whitespace-nowrap"
            >
              홈
            </Link>
            <svg
              className="w-3 h-3 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
            <Link
              href="/notice"
              className="hover:text-primary-60 transition-colors whitespace-nowrap"
            >
              알림·자료
            </Link>
            <svg
              className="w-3 h-3 flex-shrink-0 hidden sm:block"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span className="text-gray-60 font-medium truncate max-w-[300px] hidden sm:inline">
              {notice.title}
            </span>
          </nav>

          <div className="grid lg:grid-cols-[1fr_300px] gap-8">
            {/* 메인 콘텐츠 */}
            <article className="bg-white rounded-xl border border-gray-10 overflow-hidden">
              <div className="p-5 sm:p-8">
                {/* 카테고리 + 접수 상태 */}
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${categoryColor[notice.category] || "bg-primary-5 text-primary-60"}`}
                  >
                    {notice.category}
                  </span>
                  {isAccepting && (
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-orange-50 text-orange-600">
                      접수중
                    </span>
                  )}
                </div>

                {/* 배너 이미지 */}
                {notice.originalUrl &&
                  notice.originalUrl.includes("r2.dev/thumbnails") && (
                    <div className="relative rounded-xl overflow-hidden mb-5 border border-gray-10">
                      <img
                        src={notice.originalUrl}
                        alt={notice.title}
                        className="w-full h-auto object-cover"
                      />
                      <span className="absolute bottom-2 right-3 text-[10px] text-white/40">
                        AI 생성 이미지
                      </span>
                    </div>
                  )}

                {/* 제목 */}
                <h1 className="text-xl sm:text-3xl font-bold text-gray-90 mb-3 leading-tight [text-wrap:balance]">
                  {notice.title}
                </h1>

                {/* 메타 정보 */}
                <div className="flex flex-wrap gap-2 sm:gap-4 text-[12px] sm:text-sm text-gray-50 pb-4 sm:pb-5 border-b border-gray-10 mb-4 sm:mb-6">
                  {isContent ? (
                    <span>제공: 기업정책자금센터</span>
                  ) : (
                    <span>주관: {notice.source}</span>
                  )}
                  {notice.applyPeriod && (
                    <span>접수: {notice.applyPeriod}</span>
                  )}
                  <span>게시: {notice.publishDate}</span>
                </div>

                {/* 요약 박스 */}
                {notice.summary && (
                  <div className="bg-primary-5 border-l-4 border-primary-50 rounded-r-lg px-4 sm:px-5 py-3 sm:py-4 mb-6 sm:mb-8">
                    <p className="text-[13px] sm:text-sm text-primary-70 leading-relaxed whitespace-pre-line">
                      {notice.summary}
                    </p>
                  </div>
                )}

                {/* 본문 렌더링 */}
                {blocks.length > 0 && (
                  <div className="prose-content space-y-5">
                    <NoticeBodyBlocks blocks={blocks} />
                  </div>
                )}

                {/* 태그 */}
                {notice.tags && (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-8 sm:mt-10 pt-4 sm:pt-6 border-t border-gray-10">
                    {notice.tags.split(",").map((tag) => (
                      <span
                        key={tag}
                        className="bg-gray-5 text-gray-60 text-[11px] sm:text-sm px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full"
                      >
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* CTA 버튼 */}
                <div className="flex flex-wrap gap-2 sm:gap-3 mt-5 sm:mt-6">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-primary-60 text-white text-[13px] sm:text-sm font-semibold rounded-lg hover:bg-primary-70 transition-colors"
                  >
                    {isContent ? "정책자금 상담신청" : "이 공고로 상담신청"}
                  </Link>
                  <Link
                    href="/diagnosis"
                    className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 border border-gray-20 text-gray-60 text-[13px] sm:text-sm font-semibold rounded-lg hover:border-primary-40 hover:text-primary-60 transition-colors"
                  >
                    자금적격 진단
                  </Link>
                  {notice.originalUrl && !isContent && (
                    <a
                      href={notice.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-gray-20 text-gray-60 text-sm font-semibold rounded-lg hover:border-primary-40 hover:text-primary-60 transition-colors"
                    >
                      공고 바로가기
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  )}
                </div>
              </div>

              {/* 목록으로 */}
              <div className="p-6 text-center border-t border-gray-10">
                <Link
                  href="/notice"
                  className="inline-flex items-center gap-2 text-sm text-gray-60 hover:text-primary-60 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                  목록으로
                </Link>
              </div>
            </article>

            {/* 사이드바 */}
            <aside className="space-y-6">
              {/* 공고 요약 카드 */}
              <div className="bg-white rounded-xl border border-gray-10 p-5">
                <h2 className="font-bold text-gray-80 mb-3 text-sm">
                  {isContent ? "콘텐츠 정보" : "공고 요약"}
                </h2>
                <div className="space-y-3 text-xs">
                  {isContent ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-40">제공</span>
                        <span className="text-gray-70 font-medium">
                          기업정책자금센터
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-40">원천</span>
                        <span className="text-gray-70 font-medium">
                          정부 기업마당
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between">
                      <span className="text-gray-40">주관기관</span>
                      <span className="text-gray-70 font-medium">
                        {notice.source}
                      </span>
                    </div>
                  )}
                  {notice.applyPeriod && (
                    <div className="flex justify-between">
                      <span className="text-gray-40">접수기간</span>
                      <span className="text-gray-70 font-medium">
                        {notice.applyPeriod}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-40">분야</span>
                    <span className="text-gray-70 font-medium">
                      {notice.category}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-40">게시일</span>
                    <span className="text-gray-70 font-medium">
                      {notice.publishDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* 상담 CTA */}
              <div className="bg-primary-80 rounded-xl p-6 text-center">
                <p className="text-white font-bold mb-1">전문가 무료 상담</p>
                <p className="text-white/60 text-xs mb-3">
                  {isContent
                    ? "정책자금 활용에 대해 상담받으세요"
                    : "이 공고에 대해 상담받으세요"}
                </p>
                <Link
                  href="/contact"
                  className="block w-full bg-white text-primary-60 font-semibold py-2.5 rounded-lg hover:bg-gray-5 transition-colors text-sm"
                >
                  무료상담 신청
                </Link>
                <a
                  href="tel:01024664800"
                  className="block w-full mt-2 border border-white/30 text-white font-semibold py-2.5 rounded-lg hover:bg-white/10 transition-colors text-sm"
                >
                  전화상담
                </a>
              </div>

              {/* 최근 공고 */}
              {recentPosts.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-10 p-5">
                  <h2 className="font-bold text-gray-80 mb-4">최근 공고</h2>
                  <ul className="space-y-3">
                    {recentPosts.map((p) => (
                      <li key={p.pblancId}>
                        <Link
                          href={`/notice/${p.pblancId}`}
                          className="flex flex-col gap-0.5 hover:text-primary-60 transition-colors"
                        >
                          <span className="text-sm text-gray-70 hover:text-primary-60 line-clamp-2 leading-snug">
                            {p.title}
                          </span>
                          <span className="text-xs text-gray-40">
                            {p.publishDate}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 관련 서비스 */}
              <div className="bg-white rounded-xl border border-gray-10 p-5">
                <h2 className="font-bold text-gray-80 mb-4">관련 서비스</h2>
                <div className="space-y-2">
                  {[
                    { label: "운전자금", href: "/services" },
                    { label: "시설자금", href: "/services" },
                    { label: "기업인증 컨설팅", href: "/services" },
                    { label: "자금적격 진단", href: "/diagnosis" },
                  ].map((s) => (
                    <Link
                      key={s.label}
                      href={s.href}
                      className="flex items-center justify-between py-2 border-b border-gray-10 last:border-0 text-sm text-gray-70 hover:text-primary-60 transition-colors"
                    >
                      {s.label}
                      <svg
                        className="w-4 h-4 text-gray-30"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}

// ────────────────────────────────────────
// 본문 블록 렌더러 (서버 컴포넌트)
// ────────────────────────────────────────

function NoticeBodyBlocks({ blocks }: { blocks: ContentBlock[] }) {
  const elements: React.ReactNode[] = [];
  let cardBuffer: { block: ContentBlock; index: number }[] = [];

  const flushCards = () => {
    if (cardBuffer.length > 0) {
      elements.push(
        <div
          key={`card-grid-${cardBuffer[0].index}`}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {cardBuffer.map(({ block: cb, index: ci }) => renderBlock(cb, ci))}
        </div>,
      );
      cardBuffer = [];
    }
  };

  blocks.forEach((block, i) => {
    if (block.type === "card") {
      cardBuffer.push({ block, index: i });
    } else {
      flushCards();
      elements.push(renderBlock(block, i));
    }
  });
  flushCards();

  return <>{elements}</>;
}

function renderBlock(block: ContentBlock, i: number): React.ReactNode {
  if (block.type === "h2") {
    return (
      <h2
        key={i}
        className="text-base sm:text-lg font-bold text-gray-90 mt-6 sm:mt-8 mb-2 sm:mb-3 flex items-center gap-2"
      >
        <span className="w-1 h-5 bg-primary-60 rounded-full" />
        {blockText(block)}
      </h2>
    );
  }
  if (block.type === "h3") {
    return (
      <h3
        key={i}
        className="text-[14px] sm:text-base font-semibold text-gray-80 mt-4 sm:mt-6 mb-1.5 sm:mb-2"
      >
        {blockText(block)}
      </h3>
    );
  }
  if (block.type === "p" || block.type === "text") {
    return (
      <p
        key={i}
        className="text-[13px] sm:text-base text-gray-60 leading-relaxed"
      >
        {blockText(block)}
      </p>
    );
  }
  if (block.type === "ul" && block.items) {
    return (
      <ul key={i} className="space-y-2">
        {block.items.map((item, j) => (
          <li
            key={j}
            className="flex items-start gap-2 text-[13px] sm:text-base text-gray-60"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary-40 mt-2 flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    );
  }
  if (block.type === "info-box") {
    return (
      <div
        key={i}
        className="bg-primary-5 border-l-4 border-primary-40 rounded-r-lg px-4 sm:px-5 py-3 sm:py-4 text-primary-70 text-[13px] sm:text-sm font-medium"
      >
        {blockText(block)}
      </div>
    );
  }
  if (block.type === "warn-box") {
    return (
      <div
        key={i}
        className="bg-point-50/10 border-l-4 border-point-50 rounded-r-lg px-4 sm:px-5 py-3 sm:py-4 text-point-60 text-[13px] sm:text-sm font-medium"
      >
        {blockText(block)}
      </div>
    );
  }
  if (block.type === "chart-data") {
    return (
      <div
        key={i}
        className="my-4 sm:my-6 bg-gray-5 rounded-xl border border-gray-10 p-4 sm:p-5"
      >
        {block.title && (
          <h4 className="text-[13px] sm:text-sm font-bold text-gray-80 mb-3 sm:mb-4">
            {block.title}
          </h4>
        )}
        {block.chartType === "bar" && block.data && (
          <div className="space-y-2.5 sm:space-y-3">
            {block.data.map((d, di) => {
              const maxVal = Math.max(
                ...(block.data || []).map((x) => x.value),
              );
              return (
                <div key={di}>
                  <div className="flex justify-between text-[11px] sm:text-xs mb-1">
                    <span className="text-gray-60">{d.name}</span>
                    <span className="font-semibold text-gray-80">
                      {d.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2.5 sm:h-3 bg-gray-10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(d.value / maxVal) * 100}%`,
                        backgroundColor: d.color || "#0b50d0",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {block.chartType === "compare" && block.data && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
            {block.data.map((d, di) => (
              <div
                key={di}
                className="text-center bg-white rounded-lg p-2 sm:p-3 border border-gray-10"
              >
                <div
                  className="text-[15px] sm:text-2xl font-bold"
                  style={{ color: d.color || "#0b50d0" }}
                >
                  {d.value != null ? `${d.value}%` : "-"}
                </div>
                <div className="text-[9px] sm:text-[11px] text-gray-50 mt-0.5 sm:mt-1">
                  {d.name}
                </div>
              </div>
            ))}
          </div>
        )}
        {block.chartType === "table" && block.headers && block.rows && (
          <>
            <div className="hidden sm:block overflow-x-auto rounded-lg border border-gray-10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-primary-80 text-white">
                    {block.headers.map((h, hi) => (
                      <th
                        key={hi}
                        className="px-4 py-2 text-left font-semibold text-xs"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, ri) => (
                    <tr
                      key={ri}
                      className={ri % 2 === 0 ? "bg-white" : "bg-gray-5"}
                    >
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-4 py-2 text-xs text-gray-70">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <MobileTableCards headers={block.headers} rows={block.rows} />
          </>
        )}
      </div>
    );
  }
  if (block.type === "card") {
    const catColors: Record<string, { bg: string; text: string; bar: string }> =
      {
        창업: { bg: "bg-blue-50", text: "text-blue-600", bar: "#3b82f6" },
        혁신: { bg: "bg-indigo-50", text: "text-indigo-600", bar: "#6366f1" },
        수출: { bg: "bg-emerald-50", text: "text-emerald-600", bar: "#10b981" },
        녹색: { bg: "bg-violet-50", text: "text-violet-600", bar: "#8b5cf6" },
        디지털: { bg: "bg-cyan-50", text: "text-cyan-600", bar: "#06b6d4" },
        고용: { bg: "bg-amber-50", text: "text-amber-600", bar: "#f59e0b" },
        지역: { bg: "bg-teal-50", text: "text-teal-600", bar: "#14b8a6" },
        금융: { bg: "bg-sky-50", text: "text-sky-600", bar: "#0ea5e9" },
        기타: { bg: "bg-gray-50", text: "text-gray-600", bar: "#6b7280" },
      };
    const cat = block.category || "기타";
    const colors = catColors[cat] || catColors["기타"];
    const isOpen = (block.deadline || "").includes("상시");
    const cardTags = (block.tags || "")
      .replace(/#/g, "")
      .split(",")
      .filter(Boolean)
      .slice(0, 3);

    const cardHref = block.id ? `/notice/${block.id}` : undefined;

    const cardInner = (
      <div className="relative bg-white rounded-xl overflow-hidden border border-gray-10 hover:shadow-md transition-all group">
        <div className="h-1" style={{ background: colors.bar }} />
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2.5">
            <span
              className="text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded"
              style={{
                backgroundColor: `${colors.bar}15`,
                color: colors.bar,
              }}
            >
              {cat}
            </span>
            <span
              className={`text-[10px] sm:text-[11px] font-semibold px-1.5 py-0.5 rounded ${isOpen ? "bg-primary-5 text-primary-60" : "text-point-50"}`}
            >
              {isOpen ? "상시접수" : block.deadline || ""}
            </span>
          </div>
          <h4 className="font-bold text-gray-90 text-[13px] sm:text-[15px] leading-snug mb-1.5 group-hover:text-primary-60 transition-colors">
            {block.title}
          </h4>
          <p className="text-[11px] sm:text-xs text-gray-50 leading-relaxed mb-3 line-clamp-2">
            {block.summary}
          </p>
          <div className="bg-gray-5 rounded-lg p-2.5 sm:p-3 flex items-center justify-between mb-2.5">
            <div>
              <div className="text-[9px] sm:text-[10px] text-gray-40 font-medium">
                지원금액
              </div>
              <div
                className="text-sm sm:text-base font-extrabold"
                style={{ color: colors.bar }}
              >
                {block.amount || "-"}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[9px] sm:text-[10px] text-gray-40 font-medium">
                지원대상
              </div>
              <div className="text-[11px] sm:text-xs font-semibold text-gray-70">
                {block.target || "-"}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex gap-1 flex-wrap">
              {cardTags.map((tag, ti) => (
                <span
                  key={ti}
                  className="text-[9px] sm:text-[10px] bg-gray-5 text-gray-50 px-1.5 py-0.5 rounded"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
            <span className="text-[11px] sm:text-xs text-primary-60 font-semibold">
              상세보기 &rsaquo;
            </span>
          </div>
        </div>
      </div>
    );

    return cardHref ? (
      <a key={i} href={cardHref} className="block no-underline">
        {cardInner}
      </a>
    ) : (
      <div key={i}>{cardInner}</div>
    );
  }
  return null;
}
