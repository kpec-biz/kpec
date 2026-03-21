"use client";

import { useState } from "react";
import StatusBadge from "@/components/admin/StatusBadge";

interface BannerItem {
  id: string;
  title: string;
  caption: string;
  status: "draft" | "scheduled" | "posted";
  scheduledAt?: string;
  postedAt?: string;
  likes: number;
  colorOverlay: string;
  image?: string;
}

const mockBanners: BannerItem[] = [
  {
    id: "IG-001",
    title: "2026년 정책자금 신청 시작",
    caption:
      "올해 중소기업 정책자금 신청이 시작됩니다! 지금 바로 적격 여부를 확인하세요.",
    status: "posted",
    postedAt: "2026-03-21 09:00",
    likes: 45,
    colorOverlay: "#1A56A8",
    image:
      "https://pub-d5cd496aa0ad4d72b720f78967753f9f.r2.dev/images/instagram/insta-01-export.webp",
  },
  {
    id: "IG-002",
    title: "소상공인 긴급자금 지원 확대",
    caption:
      "소상공인을 위한 긴급경영안정자금이 확대됩니다. 최대 5천만원까지 지원!",
    status: "posted",
    postedAt: "2026-03-19 09:00",
    likes: 32,
    colorOverlay: "#059669",
    image:
      "https://pub-d5cd496aa0ad4d72b720f78967753f9f.r2.dev/images/instagram/insta-02-document.webp",
  },
  {
    id: "IG-003",
    title: "기술보증기금 보증한도 확대",
    caption:
      "혁신 중소기업 대상 보증한도가 50% 확대됩니다. 자세한 내용을 확인하세요.",
    status: "scheduled",
    scheduledAt: "2026-03-23 09:00",
    likes: 0,
    colorOverlay: "#7c3aed",
    image:
      "https://pub-d5cd496aa0ad4d72b720f78967753f9f.r2.dev/images/instagram/insta-03-newfund.webp",
  },
  {
    id: "IG-004",
    title: "정책자금 신청 체크리스트",
    caption: "정책자금 신청 전 꼭 확인해야 할 5가지! KPEC이 알려드립니다.",
    status: "draft",
    likes: 0,
    colorOverlay: "#dc2626",
  },
  {
    id: "IG-005",
    title: "R&D 자금 활용 가이드",
    caption:
      "정부 R&D 자금으로 기업 성장을 가속화하세요. 신청 자격과 절차를 안내합니다.",
    status: "draft",
    likes: 0,
    colorOverlay: "#d97706",
  },
];

export default function AdminInstagramPage() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered =
    activeFilter === "all"
      ? mockBanners
      : mockBanners.filter((b) => b.status === activeFilter);

  return (
    <div className="space-y-6">
      {/* Account Info */}
      <div className="bg-white rounded-xl border border-[#1A56A8]/15 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] flex items-center justify-center">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="white"
                stroke="none"
              >
                <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2zM16.5 3.5A1.5 1.5 0 1 0 18 5a1.5 1.5 0 0 0-1.5-1.5zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">@kpec77</p>
              <p className="text-xs text-[#0e2a5c]/50">kpec_fund</p>
            </div>
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-lg font-bold text-gray-900">
                {mockBanners.filter((b) => b.status === "posted").length}
              </p>
              <p className="text-xs text-[#0e2a5c]/50">게시물</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">
                {mockBanners.filter((b) => b.status === "scheduled").length}
              </p>
              <p className="text-xs text-[#0e2a5c]/50">예약</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">
                {mockBanners.filter((b) => b.status === "draft").length}
              </p>
              <p className="text-xs text-[#0e2a5c]/50">대기</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-2">
          {[
            { label: "전체", value: "all" },
            { label: "대기", value: "draft" },
            { label: "예약", value: "scheduled" },
            { label: "게재완료", value: "posted" },
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
          배너 생성
        </button>
      </div>

      {/* Banner Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((banner) => (
          <div
            key={banner.id}
            className="bg-white rounded-xl border border-[#1A56A8]/15 overflow-hidden hover:border-[#1A56A8]/25 transition-colors"
          >
            {/* Banner Preview */}
            <div
              className="aspect-square relative flex items-center justify-center p-6 overflow-hidden"
              style={{ backgroundColor: banner.colorOverlay + "15" }}
            >
              {banner.image ? (
                <>
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/10" />
                </>
              ) : (
                <div className="text-center">
                  <div
                    className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                    style={{ backgroundColor: banner.colorOverlay + "20" }}
                  >
                    <span
                      className="text-xl font-black"
                      style={{ color: banner.colorOverlay }}
                    >
                      K
                    </span>
                  </div>
                  <p
                    className="text-sm font-bold line-clamp-2"
                    style={{ color: banner.colorOverlay }}
                  >
                    {banner.title}
                  </p>
                  <p className="text-xs text-[#0e2a5c]/50 mt-2">
                    KPEC 정책자금
                  </p>
                </div>
              )}

              {/* Status overlay */}
              <div className="absolute top-3 right-3">
                <StatusBadge status={banner.status} />
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <p className="text-xs text-[#0e2a5c]/60 line-clamp-2 mb-3">
                {banner.caption}
              </p>
              <div className="flex items-center justify-between">
                <div className="text-xs text-[#0e2a5c]/50">
                  {banner.postedAt && <span>게재: {banner.postedAt}</span>}
                  {banner.scheduledAt && (
                    <span>예약: {banner.scheduledAt}</span>
                  )}
                  {!banner.postedAt && !banner.scheduledAt && (
                    <span>미예약</span>
                  )}
                </div>
                {banner.likes > 0 && (
                  <span className="text-xs text-[#0e2a5c]/50 flex items-center gap-1">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-red-400"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    {banner.likes}
                  </span>
                )}
              </div>
              <div className="flex gap-1.5 mt-3">
                {banner.status === "draft" && (
                  <button className="flex-1 px-2.5 py-1.5 text-xs font-medium text-[#1A56A8] bg-blue-50 hover:bg-blue-100 rounded-md transition-colors">
                    게재 예약
                  </button>
                )}
                {banner.status === "scheduled" && (
                  <button className="flex-1 px-2.5 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-md transition-colors">
                    즉시 게재
                  </button>
                )}
                <button className="px-2.5 py-1.5 text-xs font-medium text-white bg-[#1A56A8] hover:bg-[#134A8A] rounded-md transition-colors">
                  편집
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-[#1A56A8]/15 py-12 text-center text-[#0e2a5c]/50">
          배너가 없습니다.
        </div>
      )}
    </div>
  );
}
