"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Skeleton from "@/components/Skeleton";

interface NoticeItem {
  pblancId: string;
  title: string;
  category: string;
  source: string;
  publishDate: string;
  summary: string;
}

export default function NoticeBoard() {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [news, setNews] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/notices?exclude=뉴스,분석&limit=5").then((r) => r.json()),
      fetch("/api/notices?category=뉴스&limit=3").then((r) => r.json()),
    ])
      .then(([noticeRes, newsRes]) => {
        setNotices(noticeRes.records || []);
        setNews(newsRes.records || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-14 bg-gray-5">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-10">
          <span className="inline-block bg-primary-5 text-primary-60 text-xs font-semibold px-3 py-1 rounded-full mb-2">
            알림·자료
          </span>
          <h2 className="text-heading-md font-bold text-gray-90">
            정책자금 공고와 뉴스
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* 왼쪽: 정책자금 공고 (Airtable 리라이팅 데이터) */}
          <div className="bg-white border border-gray-10 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b-2 border-primary-60">
              <h3 className="text-sm font-bold text-gray-90 flex items-center gap-1.5">
                <svg
                  className="w-4 h-4 text-primary-60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                정책자금 공고
              </h3>
              <Link
                href="/notice"
                className="text-xs text-primary-60 font-medium"
              >
                더보기 ›
              </Link>
            </div>

            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-5 w-12 shrink-0" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-3 w-16 shrink-0" />
                  </div>
                ))}
              </div>
            ) : notices.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-40">
                공고를 불러오지 못했습니다
              </div>
            ) : (
              notices.map((item, i) => (
                <Link
                  key={item.pblancId}
                  href="/notice"
                  className="flex items-center justify-between px-5 py-3 border-b border-gray-10 last:border-b-0 hover:bg-gray-5 transition-colors text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded ${i === 0 ? "bg-red-50 text-point-50" : "bg-primary-5 text-primary-60"}`}
                    >
                      {i === 0 ? "신규" : item.category}
                    </span>
                    <span className="text-gray-80 font-medium truncate">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-xs text-gray-40 flex-shrink-0 ml-3">
                    {item.publishDate}
                  </span>
                </Link>
              ))
            )}
          </div>

          {/* 오른쪽: 정책자금 뉴스 */}
          <div className="bg-white border border-gray-10 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b-2 border-primary-60">
              <h3 className="text-sm font-bold text-gray-90 flex items-center gap-1.5">
                <svg
                  className="w-4 h-4 text-primary-60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
                정책자금 뉴스
              </h3>
              <Link
                href="/notice"
                className="text-xs text-primary-60 font-medium"
              >
                더보기 ›
              </Link>
            </div>
            <div className="p-3">
              {news.length === 0 ? (
                <div className="p-5 text-center text-sm text-gray-40">
                  {loading ? "불러오는 중..." : "뉴스가 없습니다"}
                </div>
              ) : (
                news.map((item) => (
                  <Link
                    key={item.pblancId}
                    href="/notice"
                    className="flex gap-3 p-2 rounded-lg hover:bg-gray-5 transition-colors"
                  >
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <span className="text-[10px] font-semibold text-primary-60 mb-0.5">
                        {item.category}
                      </span>
                      <span className="text-[13px] font-medium text-gray-90 line-clamp-2 leading-snug">
                        {item.title}
                      </span>
                      <span className="text-[11px] text-gray-40 mt-1">
                        {item.source} · {item.publishDate}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
