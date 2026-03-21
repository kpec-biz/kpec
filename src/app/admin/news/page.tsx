"use client";

import { useState } from "react";
import StatusBadge from "@/components/admin/StatusBadge";

interface NewsItem {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  status: "draft" | "rewritten" | "published";
  thumbnail: string;
  summary: string;
  createdAt: string;
  views: number;
}

const mockNews: NewsItem[] = [
  {
    id: "NEWS-001",
    title: "중소벤처기업부, 2026년 정책자금 3조원 규모 편성",
    source: "매일경제",
    sourceUrl: "#",
    status: "published",
    thumbnail: "",
    summary:
      "중소벤처기업부가 2026년 중소기업 정책자금을 전년 대비 15% 증액한 3조원 규모로 편성했다.",
    createdAt: "2026-03-21",
    views: 156,
  },
  {
    id: "NEWS-002",
    title: "신성장기반자금 신청 접수 시작... 혁신기업 대상",
    source: "한국경제",
    sourceUrl: "#",
    status: "published",
    thumbnail: "",
    summary:
      "혁신성장 분야 중소기업을 대상으로 하는 신성장기반자금 신청이 시작됐다.",
    createdAt: "2026-03-20",
    views: 98,
  },
  {
    id: "NEWS-003",
    title: "소상공인 재기지원 정책, 올해 대폭 강화",
    source: "조선비즈",
    sourceUrl: "#",
    status: "rewritten",
    thumbnail: "",
    summary:
      "정부가 코로나19 이후 어려움을 겪는 소상공인을 위한 재기지원 정책을 대폭 강화한다.",
    createdAt: "2026-03-19",
    views: 0,
  },
  {
    id: "NEWS-004",
    title: "기술보증기금, 혁신기업 보증 한도 확대",
    source: "서울경제",
    sourceUrl: "#",
    status: "draft",
    thumbnail: "",
    summary:
      "기술보증기금이 혁신 중소기업의 보증 한도를 기존 대비 50% 확대하는 방안을 발표했다.",
    createdAt: "2026-03-18",
    views: 0,
  },
];

export default function AdminNewsPage() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered =
    activeFilter === "all"
      ? mockNews
      : mockNews.filter((n) => n.status === activeFilter);

  return (
    <div className="space-y-6">
      {/* Pipeline Info */}
      <div className="bg-white rounded-xl border border-[#1A56A8]/15 p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-sm font-medium text-gray-700">
            뉴스 파이프라인
          </span>
          <span className="text-xs text-[#0e2a5c]/50">주 3회 자동 수집</span>
        </div>
        <p className="text-xs text-[#0e2a5c]/50">
          언론보도 수집 → Gemini 리라이팅 (출처 명시) → 썸네일 생성 → 게시
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { label: "전체", value: "all" },
          { label: "원문", value: "draft" },
          { label: "리라이팅완료", value: "rewritten" },
          { label: "게시중", value: "published" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === f.value
                ? "bg-[#1A56A8] text-white"
                : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* News Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((news) => (
          <div
            key={news.id}
            className="bg-white rounded-xl border border-[#1A56A8]/15 overflow-hidden hover:border-[#1A56A8]/25 transition-colors"
          >
            {/* Thumbnail placeholder */}
            <div className="h-40 bg-gradient-to-br from-[#E8EEF6] to-[#1A56A8]/10 flex items-center justify-center">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-[#1A56A8]/30"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <StatusBadge status={news.status} />
                <span className="text-xs text-[#0e2a5c]/50">
                  {news.source} · {news.createdAt}
                </span>
              </div>
              <h4 className="font-medium text-gray-900 line-clamp-2 text-sm mb-2">
                {news.title}
              </h4>
              <p className="text-xs text-[#0e2a5c]/60 line-clamp-2 mb-3">
                {news.summary}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#0e2a5c]/50">
                  {news.views > 0
                    ? `조회 ${news.views.toLocaleString()}`
                    : "미게시"}
                </span>
                <div className="flex gap-1.5">
                  {news.status === "draft" && (
                    <button className="px-2.5 py-1 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors">
                      리라이팅
                    </button>
                  )}
                  {news.status === "rewritten" && (
                    <button className="px-2.5 py-1 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors">
                      게시
                    </button>
                  )}
                  <button className="px-2.5 py-1 text-xs font-medium text-[#1A56A8] bg-blue-50 hover:bg-blue-100 rounded-md transition-colors">
                    편집
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-[#1A56A8]/15 py-12 text-center text-[#0e2a5c]/50">
          뉴스가 없습니다.
        </div>
      )}
    </div>
  );
}
