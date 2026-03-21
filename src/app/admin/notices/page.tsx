"use client";

import { useState } from "react";
import StatusBadge from "@/components/admin/StatusBadge";

interface Notice {
  id: string;
  title: string;
  source: string;
  originalUrl: string;
  status: "draft" | "rewritten" | "published";
  deadline: string;
  fundType: string;
  amount: string;
  createdAt: string;
  views: number;
}

const mockNotices: Notice[] = [
  {
    id: "NTC-001",
    title: "2026년 상반기 중소기업 정책자금 융자계획 공고",
    source: "기업마당",
    originalUrl: "#",
    status: "published",
    deadline: "2026-04-30",
    fundType: "운전자금",
    amount: "최대 10억원",
    createdAt: "2026-03-20",
    views: 342,
  },
  {
    id: "NTC-002",
    title: "소상공인 긴급경영안정자금 지원 공고",
    source: "기업마당",
    originalUrl: "#",
    status: "rewritten",
    deadline: "2026-05-15",
    fundType: "긴급자금",
    amount: "최대 5천만원",
    createdAt: "2026-03-19",
    views: 0,
  },
  {
    id: "NTC-003",
    title: "혁신성장 시설투자 특별자금 공고",
    source: "기업마당",
    originalUrl: "#",
    status: "published",
    deadline: "2026-06-30",
    fundType: "시설자금",
    amount: "최대 20억원",
    createdAt: "2026-03-18",
    views: 256,
  },
  {
    id: "NTC-004",
    title: "청년 창업기업 특례보증 지원사업 공고",
    source: "기업마당",
    originalUrl: "#",
    status: "draft",
    deadline: "2026-04-15",
    fundType: "창업자금",
    amount: "최대 3억원",
    createdAt: "2026-03-17",
    views: 0,
  },
  {
    id: "NTC-005",
    title: "수출기업 운전자금 특별지원 공고",
    source: "기업마당",
    originalUrl: "#",
    status: "published",
    deadline: "2026-05-31",
    fundType: "운전자금",
    amount: "최대 15억원",
    createdAt: "2026-03-15",
    views: 189,
  },
];

const statusFilter = [
  { label: "전체", value: "all" },
  { label: "원문", value: "draft" },
  { label: "리라이팅완료", value: "rewritten" },
  { label: "게시중", value: "published" },
];

export default function AdminNoticesPage() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered =
    activeFilter === "all"
      ? mockNotices
      : mockNotices.filter((n) => n.status === activeFilter);

  const counts = {
    all: mockNotices.length,
    draft: mockNotices.filter((n) => n.status === "draft").length,
    rewritten: mockNotices.filter((n) => n.status === "rewritten").length,
    published: mockNotices.filter((n) => n.status === "published").length,
  };

  return (
    <div className="space-y-6">
      {/* Pipeline Summary */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-gray-700">
            파이프라인 상태
          </span>
          <span className="text-xs text-gray-400">매일 09:00 자동 수집</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{counts.draft}</p>
            <p className="text-xs text-gray-500 mt-1">원문 수집</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {counts.rewritten}
            </p>
            <p className="text-xs text-gray-500 mt-1">리라이팅 완료</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {counts.published}
            </p>
            <p className="text-xs text-gray-500 mt-1">게시중</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-2">
          {statusFilter.map((f) => (
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
              <span className="ml-1.5 text-xs opacity-70">
                {counts[f.value as keyof typeof counts]}
              </span>
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#1A56A8] text-white rounded-lg text-sm font-medium hover:bg-[#134A8A] transition-colors">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          수동 수집
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left py-3 px-4 text-gray-400 font-medium w-[40%]">
                  제목
                </th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium hidden sm:table-cell">
                  자금유형
                </th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium hidden md:table-cell">
                  규모
                </th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium hidden md:table-cell">
                  마감일
                </th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium hidden lg:table-cell">
                  조회
                </th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">
                  상태
                </th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">
                  관리
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((notice) => (
                <tr
                  key={notice.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50"
                >
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900 line-clamp-1">
                      {notice.title}
                    </span>
                    <span className="text-xs text-gray-400 block mt-0.5">
                      {notice.source} · {notice.createdAt}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 hidden sm:table-cell">
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                      {notice.fundType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 hidden md:table-cell text-xs">
                    {notice.amount}
                  </td>
                  <td className="py-3 px-4 text-gray-600 hidden md:table-cell text-xs">
                    {notice.deadline}
                  </td>
                  <td className="py-3 px-4 text-gray-500 hidden lg:table-cell">
                    {notice.views > 0 ? notice.views.toLocaleString() : "-"}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={notice.status} />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1.5">
                      {notice.status === "draft" && (
                        <button className="px-2.5 py-1 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors">
                          리라이팅
                        </button>
                      )}
                      {notice.status === "rewritten" && (
                        <button className="px-2.5 py-1 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors">
                          게시
                        </button>
                      )}
                      {notice.status === "published" && (
                        <button className="px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors">
                          비게시
                        </button>
                      )}
                      <button className="px-2.5 py-1 text-xs font-medium text-[#1A56A8] bg-blue-50 hover:bg-blue-100 rounded-md transition-colors">
                        편집
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    공고가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
