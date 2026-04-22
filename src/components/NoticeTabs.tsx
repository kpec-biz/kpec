"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { NoticeItem } from "@/lib/notices";
import type { FaqItem } from "@/data/faq";

interface Props {
  initialNotices: NoticeItem[];
  initialNoticeOffset: string | null;
  initialNews: NoticeItem[];
  initialNewsOffset: string | null;
  initialAnalysis: NoticeItem[];
  initialAnalysisOffset: string | null;
  faqs: FaqItem[];
}

const tabs = ["정책자금 공고", "정책자금 뉴스", "정책자금 분석", "FAQ"];

const tabMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 } as const,
  transition: { duration: 0.25, ease: [0, 0, 0.2, 1] as const },
};

const PAGE_SIZE = 20;

export default function NoticeTabs({
  initialNotices,
  initialNoticeOffset,
  initialNews,
  initialNewsOffset,
  initialAnalysis,
  initialAnalysisOffset,
  faqs,
}: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const [notices, setNotices] = useState<NoticeItem[]>(initialNotices);
  const [newsData, setNewsData] = useState<NoticeItem[]>(initialNews);
  const [analysisData, setAnalysisData] =
    useState<NoticeItem[]>(initialAnalysis);
  const [noticeOffset, setNoticeOffset] = useState<string | null>(
    initialNoticeOffset,
  );
  const [newsOffset, setNewsOffset] = useState<string | null>(
    initialNewsOffset,
  );
  const [analysisOffset, setAnalysisOffset] = useState<string | null>(
    initialAnalysisOffset,
  );
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMore = useCallback(
    async (type: "notice" | "news" | "analysis") => {
      const offset =
        type === "notice"
          ? noticeOffset
          : type === "news"
            ? newsOffset
            : analysisOffset;
      if (!offset || loadingMore) return;

      setLoadingMore(true);
      try {
        const params = new URLSearchParams({
          limit: String(PAGE_SIZE),
          offset,
        });
        if (type === "notice") {
          params.set("exclude", "뉴스,분석");
        } else if (type === "news") {
          params.set("category", "뉴스");
        } else {
          params.set("category", "분석");
        }

        const res = await fetch(`/api/notices?${params.toString()}`);
        const data = await res.json();
        const newRecords: NoticeItem[] = data.records || [];

        if (type === "notice") {
          setNotices((prev) => [...prev, ...newRecords]);
          setNoticeOffset(data.offset || null);
        } else if (type === "news") {
          setNewsData((prev) => [...prev, ...newRecords]);
          setNewsOffset(data.offset || null);
        } else {
          setAnalysisData((prev) => [...prev, ...newRecords]);
          setAnalysisOffset(data.offset || null);
        }
      } catch {
        /* ignore */
      } finally {
        setLoadingMore(false);
      }
    },
    [noticeOffset, newsOffset, analysisOffset, loadingMore],
  );

  return (
    <>
      {/* 탭 */}
      <div
        role="tablist"
        className="flex gap-0.5 sm:gap-1 mb-6 sm:mb-8 border-b-2 border-gray-10 overflow-x-auto scrollbar-hide"
      >
        {tabs.map((tab, i) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === i}
            onClick={() => setActiveTab(i)}
            className={`px-3 sm:px-5 py-2.5 sm:py-3 text-[13px] sm:text-sm font-semibold transition-colors relative whitespace-nowrap flex-shrink-0 ${
              activeTab === i
                ? "text-primary-60"
                : "text-gray-50 hover:text-gray-80"
            }`}
          >
            {tab}
            {activeTab === i && (
              <motion.span
                layoutId="tab-indicator"
                className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-primary-60"
                transition={{ duration: 0.25, ease: "easeOut" }}
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* 탭 1: 정책자금 공고 */}
        {activeTab === 0 && (
          <motion.div
            key="tab-0"
            {...tabMotion}
            className="bg-white rounded-xl border border-gray-10"
          >
            {notices.length === 0 ? (
              <div className="p-12 text-center text-gray-40">
                공고를 불러오지 못했습니다
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-10">
                  {notices.map((item, i) => (
                    <NoticeRow key={item.pblancId} item={item} index={i} />
                  ))}
                </div>
                {noticeOffset && (
                  <button
                    onClick={() => loadMore("notice")}
                    disabled={loadingMore}
                    className="w-full py-3 text-[13px] font-semibold text-primary-60 hover:bg-gray-5 transition-colors border-t border-gray-10 disabled:opacity-50"
                  >
                    {loadingMore ? "불러오는 중..." : "더 불러오기"}
                  </button>
                )}
              </>
            )}
            <div className="px-4 sm:px-5 py-2.5 sm:py-3 border-t border-gray-10 text-right">
              <span className="text-[10px] sm:text-xs text-gray-40">
                출처: 기업마당(bizinfo.go.kr) · 매일 09시 업데이트
              </span>
            </div>
          </motion.div>
        )}

        {/* 탭 2: 정책자금 뉴스 */}
        {activeTab === 1 && (
          <motion.div key="tab-1" {...tabMotion}>
            {newsData.length === 0 ? (
              <div className="py-12 text-center text-gray-40">
                뉴스를 불러오지 못했습니다
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-2.5 sm:gap-4">
                  {newsData.map((item) => (
                    <ContentCard key={item.pblancId} item={item} />
                  ))}
                </div>
                {newsOffset && (
                  <button
                    onClick={() => loadMore("news")}
                    disabled={loadingMore}
                    className="w-full mt-3 py-2.5 text-[13px] font-semibold text-primary-60 bg-white border border-gray-10 rounded-lg hover:bg-gray-5 transition-colors disabled:opacity-50"
                  >
                    {loadingMore ? "불러오는 중..." : "더 불러오기"}
                  </button>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* 탭 3: 정책자금 분석 */}
        {activeTab === 2 && (
          <motion.div key="tab-2" {...tabMotion}>
            {analysisData.length === 0 ? (
              <div className="py-12 text-center text-gray-40">
                분석 리포트를 불러오지 못했습니다
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-2.5 sm:gap-4">
                  {analysisData.map((item) => (
                    <ContentCard key={item.pblancId} item={item} />
                  ))}
                </div>
                {analysisOffset && (
                  <button
                    onClick={() => loadMore("analysis")}
                    disabled={loadingMore}
                    className="w-full mt-3 py-2.5 text-[13px] font-semibold text-primary-60 bg-white border border-gray-10 rounded-lg hover:bg-gray-5 transition-colors disabled:opacity-50"
                  >
                    {loadingMore ? "불러오는 중..." : "더 불러오기"}
                  </button>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* 탭 4: FAQ */}
        {activeTab === 3 && (
          <motion.div key="tab-3" {...tabMotion} className="space-y-3">
            {faqs.map((item, i) => (
              <FaqRow key={i} q={item.question} a={item.answer} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ContentCard({ item }: { item: NoticeItem }) {
  const hasThumbnail = item.originalUrl?.includes("r2.dev/thumbnails");

  return (
    <Link
      href={`/notice/${item.pblancId}`}
      className="group bg-white rounded-xl border border-gray-10 overflow-hidden hover:border-primary-50 hover:shadow-md transition-all"
    >
      {hasThumbnail && (
        <div className="relative aspect-[16/9] overflow-hidden bg-gray-10">
          <img
            src={item.originalUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <span className="absolute bottom-1.5 right-2 text-[9px] text-white/40">
            AI 생성 이미지
          </span>
        </div>
      )}
      <div className="p-4 sm:p-5">
        <span
          className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-1.5 sm:mb-2 ${
            item.category === "분석"
              ? "bg-point-50/10 text-point-50"
              : "bg-success/10 text-success"
          }`}
        >
          {item.category === "분석" ? "정책자금 분석" : "정책자금 뉴스"}
        </span>
        <h3 className="text-[11px] sm:text-sm font-bold text-gray-90 mb-1 sm:mb-2 line-clamp-2 leading-snug group-hover:text-primary-60 transition-colors">
          {item.title}
        </h3>
        <p className="text-[10px] sm:text-xs text-gray-50 line-clamp-2 leading-relaxed mb-1.5 sm:mb-3 hidden sm:block">
          {item.summary}
        </p>
        <div className="text-[10px] sm:text-[11px] text-gray-40">
          기업정책자금센터 · {item.publishDate}
        </div>
      </div>
    </Link>
  );
}

function NoticeRow({ item, index }: { item: NoticeItem; index: number }) {
  const categoryColor: Record<string, string> = {
    기술: "bg-blue-50/10 text-blue-600",
    경영: "bg-green-50/10 text-green-600",
    인력: "bg-orange-50/10 text-orange-600",
    금융: "bg-purple-50/10 text-purple-600",
    공고: "bg-primary-5 text-primary-60",
    분석: "bg-point-50/10 text-point-50",
    뉴스: "bg-success/10 text-success",
  };

  return (
    <Link
      href={`/notice/${item.pblancId}`}
      className="flex items-center gap-2 sm:gap-4 py-3 sm:py-4 px-4 sm:px-5 hover:bg-gray-5 transition-colors"
    >
      <span
        className={`flex-shrink-0 text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full ${index === 0 ? "bg-red-50 text-point-50" : categoryColor[item.category] || "bg-primary-5 text-primary-60"}`}
      >
        {index === 0 ? "신규" : item.category}
      </span>
      <span className="flex-1 text-[12px] sm:text-base text-gray-80 font-medium truncate">
        {item.title}
      </span>
      <span className="flex-shrink-0 text-[11px] sm:text-sm text-gray-40 hidden sm:inline">
        {item.publishDate}
      </span>
      <svg
        className="w-4 h-4 text-gray-30 flex-shrink-0 hidden sm:block"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

function FaqRow({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-10 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 text-left bg-white hover:bg-gray-5 transition-colors"
      >
        <span className="text-[13px] sm:text-base font-semibold text-gray-90">
          {q}
        </span>
        <svg
          className={`w-5 h-5 text-gray-50 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-5 text-[13px] sm:text-base text-gray-70 leading-relaxed border-t border-gray-10">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
