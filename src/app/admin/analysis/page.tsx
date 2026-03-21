"use client";

import { useState } from "react";
import StatusBadge from "@/components/admin/StatusBadge";

interface AnalysisReport {
  id: string;
  title: string;
  status: "generating" | "review" | "published";
  fundTarget: string;
  summary: string;
  createdAt: string;
  views: number;
  showOnHome: boolean;
}

const mockReports: AnalysisReport[] = [
  {
    id: "ANL-001",
    title: "2026년 상반기 중소기업 정책자금 핵심 분석",
    status: "published",
    fundTarget: "운전자금 / 시설자금",
    summary:
      "2026년 상반기 중소기업 정책자금의 핵심 변경사항과 신청 전략을 분석합니다.",
    createdAt: "2026-03-20",
    views: 234,
    showOnHome: true,
  },
  {
    id: "ANL-002",
    title: "소상공인 긴급경영안정자금 심층 리포트",
    status: "published",
    fundTarget: "긴급자금",
    summary:
      "최근 경기 침체에 대응한 소상공인 긴급자금 지원 확대 방안을 분석합니다.",
    createdAt: "2026-03-18",
    views: 178,
    showOnHome: true,
  },
  {
    id: "ANL-003",
    title: "혁신성장 기업을 위한 정부 R&D 자금 가이드",
    status: "review",
    fundTarget: "R&D자금",
    summary:
      "혁신성장 분야 기업이 활용할 수 있는 정부 R&D 자금과 신청 요건을 정리합니다.",
    createdAt: "2026-03-17",
    views: 0,
    showOnHome: false,
  },
  {
    id: "ANL-004",
    title: "2026년 기술보증기금 보증제도 변경 분석",
    status: "generating",
    fundTarget: "보증제도",
    summary:
      "기술보증기금의 2026년 보증한도 확대 및 신규 보증 상품을 분석합니다.",
    createdAt: "2026-03-16",
    views: 0,
    showOnHome: false,
  },
];

export default function AdminAnalysisPage() {
  const [reports, setReports] = useState(mockReports);
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered =
    activeFilter === "all"
      ? reports
      : reports.filter((r) => r.status === activeFilter);

  const toggleHome = (id: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, showOnHome: !r.showOnHome } : r)),
    );
  };

  return (
    <div className="space-y-6">
      {/* Pipeline Info */}
      <div className="bg-white rounded-xl border border-[#1A56A8]/15 p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          <span className="text-sm font-medium text-gray-700">
            분석 파이프라인
          </span>
          <span className="text-xs text-[#0e2a5c]/50">gov-posts 자동 생성</span>
        </div>
        <p className="text-xs text-[#0e2a5c]/50">
          기업마당 최신 공고 + 정부 데이터 → Gemini Pro 분석 → 배너 이미지 생성
          → 검토 → 게시
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { label: "전체", value: "all" },
          { label: "생성중", value: "generating" },
          { label: "검토", value: "review" },
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

      {/* Reports */}
      <div className="space-y-4">
        {filtered.map((report) => (
          <div
            key={report.id}
            className="bg-white rounded-xl border border-[#1A56A8]/15 p-5 hover:border-[#1A56A8]/25 transition-colors"
          >
            <div className="flex items-start gap-4">
              {/* Banner placeholder */}
              <div className="w-32 h-20 rounded-lg bg-gradient-to-br from-[#1A56A8]/10 to-[#1A56A8]/5 flex items-center justify-center shrink-0 hidden sm:flex">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-[#1A56A8]/40"
                >
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <StatusBadge status={report.status} />
                  <span className="px-2 py-0.5 bg-[#1A56A8] text-white rounded text-xs">
                    {report.fundTarget}
                  </span>
                  {report.showOnHome && (
                    <span className="px-2 py-0.5 bg-[#1A56A8]/10 text-[#1A56A8] rounded text-xs font-medium">
                      홈 노출
                    </span>
                  )}
                </div>
                <h4 className="font-medium text-gray-900 line-clamp-1">
                  {report.title}
                </h4>
                <p className="text-xs text-[#0e2a5c]/60 mt-1 line-clamp-1">
                  {report.summary}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-[#0e2a5c]/50">
                  <span>{report.createdAt}</span>
                  {report.views > 0 && (
                    <span>조회 {report.views.toLocaleString()}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5 shrink-0">
                <button
                  onClick={() => toggleHome(report.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    report.showOnHome
                      ? "text-[#1A56A8] bg-blue-50 hover:bg-blue-100"
                      : "text-[#0e2a5c]/50 bg-[#E8EEF6]/30 hover:bg-[#E8EEF6]/50"
                  }`}
                >
                  {report.showOnHome ? "홈 노출 ON" : "홈 노출 OFF"}
                </button>
                {report.status === "review" && (
                  <button className="px-2.5 py-1 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors">
                    게시
                  </button>
                )}
                <button className="px-2.5 py-1 text-xs font-medium text-white bg-[#1A56A8] hover:bg-[#134A8A] rounded-md transition-colors">
                  편집
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-[#1A56A8]/15 py-12 text-center text-[#0e2a5c]/50">
          분석 리포트가 없습니다.
        </div>
      )}
    </div>
  );
}
