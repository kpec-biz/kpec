"use client";

import { useState } from "react";
import StatusBadge from "@/components/admin/StatusBadge";

const categories = ["전체", "공지사항", "정책자금", "성공사례", "기업지원"];

const mockPosts = [
  {
    id: "1",
    title: "2026년 상반기 중소기업 정책자금 안내",
    category: "정책자금",
    date: "2026-03-20",
    views: 342,
    status: "published",
  },
  {
    id: "2",
    title: "시설자금 지원 대상 확대 공지",
    category: "공지사항",
    date: "2026-03-18",
    views: 256,
    status: "published",
  },
  {
    id: "3",
    title: "(주)테크스타트 운전자금 3억원 승인 사례",
    category: "성공사례",
    date: "2026-03-15",
    views: 189,
    status: "published",
  },
  {
    id: "4",
    title: "기업인증 컨설팅 서비스 안내",
    category: "기업지원",
    date: "2026-03-12",
    views: 145,
    status: "published",
  },
  {
    id: "5",
    title: "2026년 하반기 정책자금 일정 (임시저장)",
    category: "정책자금",
    date: "2026-03-10",
    views: 0,
    status: "draft",
  },
  {
    id: "6",
    title: "벤처기업인증 취득 성공 사례",
    category: "성공사례",
    date: "2026-03-08",
    views: 98,
    status: "published",
  },
];

export default function AdminBoardPage() {
  const [activeCategory, setActiveCategory] = useState("전체");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  const filtered =
    activeCategory === "전체"
      ? mockPosts
      : mockPosts.filter((p) => p.category === activeCategory);

  const totalPages = Math.max(1, Math.ceil(filtered.length / postsPerPage));
  const paged = filtered.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Category Tabs */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-[#1A56A8] text-white"
                  : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {cat}
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
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          글 작성
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#1A56A8]/15 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1A56A8] bg-[#1A56A8]">
                <th className="text-left py-3 px-4 text-white font-semibold w-[350px]">
                  제목
                </th>
                <th className="text-left py-3 px-4 text-white font-semibold hidden sm:table-cell">
                  카테고리
                </th>
                <th className="text-left py-3 px-4 text-white font-semibold hidden md:table-cell">
                  작성일
                </th>
                <th className="text-left py-3 px-4 text-white font-semibold hidden md:table-cell">
                  조회수
                </th>
                <th className="text-left py-3 px-4 text-white font-semibold">
                  상태
                </th>
                <th className="text-left py-3 px-4 text-white font-semibold">
                  관리
                </th>
              </tr>
            </thead>
            <tbody>
              {paged.map((post) => (
                <tr
                  key={post.id}
                  className="border-b border-[#1A56A8]/10 hover:bg-[#E8EEF6]/50"
                >
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900 line-clamp-1">
                      {post.title}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 hidden sm:table-cell">
                    {post.category}
                  </td>
                  <td className="py-3 px-4 text-gray-500 hidden md:table-cell">
                    {post.date}
                  </td>
                  <td className="py-3 px-4 text-gray-500 hidden md:table-cell">
                    {post.views.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={post.status} />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button className="px-2.5 py-1 text-xs font-medium text-[#1A56A8] bg-blue-50 hover:bg-blue-100 rounded-md transition-colors">
                        수정
                      </button>
                      <button className="px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors">
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    게시글이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#1A56A8]/10">
          <span className="text-xs text-gray-400">총 {filtered.length}건</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <span className="text-sm text-gray-600 px-3">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
