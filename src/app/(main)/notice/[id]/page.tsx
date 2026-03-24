"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import DocumentScanner from "@/components/DocumentScanner";

/* Mobile: 표 → 뱃지 카드형 (첫 번째 컬럼이 행 라벨) */
function MobileTableCards({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  const [active, setActive] = useState(0);
  const row = rows[active];

  return (
    <div className="sm:hidden">
      {/* 뱃지 그리드 - flex-wrap, 선택 상태 강조 + 그림자 */}
      <div className="flex flex-wrap gap-1.5 mb-0">
        {rows.map((r, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`px-3 py-2 rounded-t-lg text-[11px] font-semibold transition-all ${
              active === i
                ? "bg-primary-60 text-white shadow-md relative z-10 -mb-px"
                : "bg-gray-5 border border-gray-10 border-b-0 text-gray-50 hover:bg-gray-10"
            }`}
          >
            {r[0]}
          </button>
        ))}
      </div>

      {/* 상세 카드 - 선택된 탭과 연결 */}
      <div className="bg-white border border-gray-10 rounded-b-xl rounded-tr-xl overflow-hidden shadow-sm">
        {headers.slice(1).map((h, hi) => (
          <div
            key={hi}
            className={`flex items-start gap-2 px-3.5 py-2 ${hi % 2 === 1 ? "bg-gray-5" : ""}`}
          >
            <span className="text-[10px] font-semibold text-gray-50 w-14 flex-shrink-0 pt-0.5">
              {h}
            </span>
            <span className="text-[12px] text-gray-80">
              {row[hi + 1] || "-"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface NoticeItem {
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

interface ContentBlock {
  type:
    | "h2"
    | "h3"
    | "p"
    | "text"
    | "ul"
    | "info-box"
    | "warn-box"
    | "chart-data";
  text?: string;
  items?: string[];
  chartType?: "bar" | "compare" | "table";
  title?: string;
  data?: Array<{ name: string; value: number; color?: string }>;
  headers?: string[];
  rows?: string[][];
}

export default function NoticeDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [notice, setNotice] = useState<NoticeItem | null>(null);
  const [content, setContent] = useState<ContentBlock[]>([]);
  const [recentPosts, setRecentPosts] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    Promise.all([
      fetch(`/api/notices?id=${id}`).then((r) => r.json()),
      fetch("/api/notices?limit=5").then((r) => r.json()),
    ])
      .then(async ([noticeRes, recentRes]) => {
        const item = noticeRes.records?.[0];
        if (!item) return;

        setNotice(item);
        setRecentPosts(
          (recentRes.records || [])
            .filter((r: NoticeItem) => r.pblancId !== item.pblancId)
            .slice(0, 3),
        );

        // 서버 프록시를 통해 R2 본문 JSON fetch (CORS 우회)
        if (item.contentUrl) {
          try {
            const contentRes = await fetch(
              `/api/notices/content?url=${encodeURIComponent(item.contentUrl)}`,
            );
            const contentJson = await contentRes.json();
            if (Array.isArray(contentJson)) {
              setContent(contentJson);
            }
          } catch {
            // contentUrl이 없거나 실패 시 빈 배열
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          bgImage="/images/headers/notice.png"
          title="알림·자료"
          subtitle=""
        />
        <DocumentScanner text="공고 내용을 불러오고 있습니다..." />
      </div>
    );
  }

  if (!notice) {
    return (
      <>
        <PageHeader
          bgImage="/images/headers/notice.png"
          title="알림·자료"
          subtitle=""
        />
        <div className="py-20 text-center text-gray-40">
          <p className="mb-4">공고를 찾을 수 없습니다</p>
          <Link href="/notice" className="text-primary-60 underline">
            목록으로 돌아가기
          </Link>
        </div>
      </>
    );
  }

  // 접수 상태 판단
  const isAccepting =
    notice.applyPeriod?.includes("상시") ||
    (notice.applyPeriod &&
      new Date(notice.applyPeriod.split("~")[1]?.trim() || "") >= new Date());

  const categoryColor: Record<string, string> = {
    기술: "bg-blue-50 text-blue-600",
    경영: "bg-green-50 text-green-600",
    인력: "bg-orange-50 text-orange-600",
    금융: "bg-purple-50 text-purple-600",
    공고: "bg-primary-5 text-primary-60",
    분석: "bg-point-50/10 text-point-50",
    뉴스: "bg-success/10 text-success",
  };

  return (
    <>
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
            {/* 제목은 PC에서만 브레드크럼에 표시 */}
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
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl border border-gray-10 overflow-hidden"
            >
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

                {/* 배너 이미지 (뉴스/분석) */}
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
                  <span>주관: {notice.source}</span>
                  {notice.applyPeriod && (
                    <span>접수: {notice.applyPeriod}</span>
                  )}
                  <span>게시: {notice.publishDate}</span>
                </div>

                {/* 요약 박스 */}
                <div className="bg-primary-5 border-l-4 border-primary-50 rounded-r-lg px-4 sm:px-5 py-3 sm:py-4 mb-6 sm:mb-8">
                  <p className="text-[13px] sm:text-sm text-primary-70 leading-relaxed">
                    {notice.summary.split(/(?<=\.\s)/).map((sentence, si) => (
                      <span key={si}>
                        {sentence}
                        {si < notice.summary.split(/(?<=\.\s)/).length - 1 && (
                          <br className="hidden md:block" />
                        )}
                      </span>
                    ))}
                  </p>
                </div>

                {/* 본문 렌더링 (R2 JSON) */}
                {content.length > 0 && (
                  <div className="prose-content space-y-5">
                    {content.map((block, i) => {
                      if (block.type === "h2") {
                        return (
                          <h2
                            key={i}
                            className="text-base sm:text-lg font-bold text-gray-90 mt-6 sm:mt-8 mb-2 sm:mb-3 flex items-center gap-2"
                          >
                            <span className="w-1 h-5 bg-primary-60 rounded-full" />
                            {block.text}
                          </h2>
                        );
                      }
                      if (block.type === "h3") {
                        return (
                          <h3
                            key={i}
                            className="text-[14px] sm:text-base font-semibold text-gray-80 mt-4 sm:mt-6 mb-1.5 sm:mb-2"
                          >
                            {block.text}
                          </h3>
                        );
                      }
                      if (block.type === "p" || block.type === "text") {
                        return (
                          <p
                            key={i}
                            className="text-[13px] sm:text-base text-gray-60 leading-relaxed"
                          >
                            {block.text}
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
                            {block.text}
                          </div>
                        );
                      }
                      if (block.type === "warn-box") {
                        return (
                          <div
                            key={i}
                            className="bg-point-50/10 border-l-4 border-point-50 rounded-r-lg px-4 sm:px-5 py-3 sm:py-4 text-point-60 text-[13px] sm:text-sm font-medium"
                          >
                            {block.text}
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
                                        <span className="text-gray-60">
                                          {d.name}
                                        </span>
                                        <span className="font-semibold text-gray-80">
                                          {d.value.toLocaleString()}
                                        </span>
                                      </div>
                                      <div className="h-2.5 sm:h-3 bg-gray-10 rounded-full overflow-hidden">
                                        <div
                                          className="h-full rounded-full transition-all duration-700"
                                          style={{
                                            width: `${(d.value / maxVal) * 100}%`,
                                            backgroundColor:
                                              d.color || "#0b50d0",
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
                            {block.chartType === "table" &&
                              block.headers &&
                              block.rows && (
                                <>
                                  {/* PC: 표 */}
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
                                            className={
                                              ri % 2 === 0
                                                ? "bg-white"
                                                : "bg-gray-5"
                                            }
                                          >
                                            {row.map((cell, ci) => (
                                              <td
                                                key={ci}
                                                className="px-4 py-2 text-xs text-gray-70"
                                              >
                                                {cell}
                                              </td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                  {/* Mobile: 뱃지 카드형 */}
                                  <MobileTableCards
                                    headers={block.headers}
                                    rows={block.rows}
                                  />
                                </>
                              )}
                          </div>
                        );
                      }
                      return null;
                    })}
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
                    이 공고로 상담신청
                  </Link>
                  <Link
                    href="/diagnosis"
                    className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 border border-gray-20 text-gray-60 text-[13px] sm:text-sm font-semibold rounded-lg hover:border-primary-40 hover:text-primary-60 transition-colors"
                  >
                    자금적격 진단
                  </Link>
                  {notice.originalUrl && (
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
            </motion.article>

            {/* 사이드바 */}
            <motion.aside
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="space-y-6"
            >
              {/* 공고 요약 카드 */}
              <div className="bg-white rounded-xl border border-gray-10 p-5">
                <h3 className="font-bold text-gray-80 mb-3 text-sm">
                  공고 요약
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-40">주관기관</span>
                    <span className="text-gray-70 font-medium">
                      {notice.source}
                    </span>
                  </div>
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
                  이 공고에 대해 상담받으세요
                </p>
                <Link
                  href="/contact"
                  className="block w-full bg-white text-primary-60 font-semibold py-2.5 rounded-lg hover:bg-gray-5 transition-colors text-sm"
                >
                  무료상담 신청
                </Link>
                <a
                  href="tel:050268004681"
                  className="block w-full mt-2 border border-white/30 text-white font-semibold py-2.5 rounded-lg hover:bg-white/10 transition-colors text-sm"
                >
                  전화상담
                </a>
              </div>

              {/* 최근 공고 */}
              <div className="bg-white rounded-xl border border-gray-10 p-5">
                <h3 className="font-bold text-gray-80 mb-4">최근 공고</h3>
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

              {/* 관련 서비스 */}
              <div className="bg-white rounded-xl border border-gray-10 p-5">
                <h3 className="font-bold text-gray-80 mb-4">관련 서비스</h3>
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
            </motion.aside>
          </div>
        </div>
      </section>
    </>
  );
}
