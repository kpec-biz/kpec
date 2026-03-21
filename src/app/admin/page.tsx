"use client";

import { useState } from "react";
import Link from "next/link";
import StatsCard from "@/components/admin/StatsCard";
import ChartWrapper from "@/components/admin/ChartWrapper";
import StatusBadge from "@/components/admin/StatusBadge";
import { adminHref } from "@/lib/admin-utils";

const mockStats = {
  totalInquiries: 47,
  newInquiries: 5,
  publishedNotices: 12,
  publishedNews: 8,
  publishedAnalysis: 4,
  postedBanners: 15,
};

const mockChartData = {
  labels: ["월", "화", "수", "목", "금", "토", "일"],
  datasets: [
    {
      label: "방문자",
      data: [120, 190, 150, 210, 180, 90, 70],
      borderColor: "#1A56A8",
      backgroundColor: "rgba(26, 86, 168, 0.08)",
      fill: true,
      tension: 0.4,
    },
    {
      label: "접수",
      data: [3, 5, 2, 4, 3, 1, 0],
      borderColor: "#dc2626",
      backgroundColor: "transparent",
      fill: false,
      tension: 0.4,
    },
  ],
};

const mockRecentActivity = [
  {
    type: "inquiry",
    badge: "일반접수",
    badgeColor: "bg-blue-50 text-blue-700",
    text: "(주)테스트기업 - 홍길동",
    time: "14분 전",
  },
  {
    type: "inquiry",
    badge: "자금진단",
    badgeColor: "bg-purple-50 text-purple-700",
    text: "스타트업A - 김철수",
    time: "2시간 전",
  },
  {
    type: "notice",
    badge: "공고 게시",
    badgeColor: "bg-green-50 text-green-700",
    text: "2026년 상반기 중소기업 정책자금 안내",
    time: "3시간 전",
  },
  {
    type: "news",
    badge: "뉴스 게시",
    badgeColor: "bg-green-50 text-green-700",
    text: "중소벤처기업부, 2026년 정책자금 3조원 편성",
    time: "5시간 전",
  },
  {
    type: "instagram",
    badge: "인스타 게재",
    badgeColor: "bg-pink-50 text-pink-700",
    text: "2026년 정책자금 신청 시작 배너",
    time: "어제",
  },
];

const mockPipelineStatus = [
  {
    name: "공고 수집",
    status: "active",
    count: 12,
    schedule: "매일 09:00",
  },
  { name: "뉴스 수집", status: "active", count: 8, schedule: "주 3회" },
  { name: "분석 리포트", status: "active", count: 4, schedule: "수동" },
  {
    name: "인스타 배너",
    status: "active",
    count: 15,
    schedule: "수동/예약",
  },
];

const mockRecentInquiries = [
  {
    id: "INQ-001",
    type: "general" as const,
    company: "(주)테스트기업",
    name: "홍길동",
    date: "2026-03-21",
    status: "new",
  },
  {
    id: "INQ-002",
    type: "diagnosis" as const,
    company: "스타트업A",
    name: "김철수",
    date: "2026-03-21",
    status: "new",
  },
  {
    id: "INQ-003",
    type: "general" as const,
    company: "(주)성공기업",
    name: "이영희",
    date: "2026-03-20",
    status: "progress",
  },
  {
    id: "INQ-004",
    type: "diagnosis" as const,
    company: "바이오텍코리아",
    name: "박민수",
    date: "2026-03-19",
    status: "progress",
  },
];

export default function AdminDashboardPage() {
  const [chartPeriod, setChartPeriod] = useState<7 | 14 | 30>(7);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard
          label="전체 접수"
          value={mockStats.totalInquiries}
          change={`신규 ${mockStats.newInquiries}건`}
          changeType="neutral"
          iconBg="#fee2e2"
          iconColor="#dc2626"
          icon={
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" />
            </svg>
          }
        />
        <StatsCard
          label="신규 접수"
          value={mockStats.newInquiries}
          change="금일"
          changeType="negative"
          iconBg="#fef3c7"
          iconColor="#d97706"
          icon={
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          }
        />
        <StatsCard
          label="게시 공고"
          value={mockStats.publishedNotices}
          change="활성"
          changeType="positive"
          iconBg="#E8EEF6"
          iconColor="#1A56A8"
          icon={
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          }
        />
        <StatsCard
          label="게시 뉴스"
          value={mockStats.publishedNews}
          change="활성"
          changeType="positive"
          iconBg="#d1fae5"
          iconColor="#059669"
          icon={
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1" />
              <path d="M15 13h6M15 17h6M15 9h6M3 10h10" />
            </svg>
          }
        />
        <StatsCard
          label="분석 리포트"
          value={mockStats.publishedAnalysis}
          change="게시중"
          changeType="positive"
          iconBg="#ede9fe"
          iconColor="#7c3aed"
          icon={
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
          }
        />
        <StatsCard
          label="인스타 게재"
          value={mockStats.postedBanners}
          change="총 게시물"
          changeType="neutral"
          iconBg="#fce7f3"
          iconColor="#db2777"
          icon={
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="5" />
            </svg>
          }
        />
      </div>

      {/* Charts + Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900">주간 현황</h3>
              <div className="flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1A56A8]" />
                  방문자
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626]" />
                  접수
                </span>
              </div>
            </div>
            <div className="flex gap-1">
              {([7, 14, 30] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setChartPeriod(d)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    chartPeriod === d
                      ? "bg-[#1A56A8] text-white"
                      : "text-gray-400 hover:bg-gray-100"
                  }`}
                >
                  {d}일
                </button>
              ))}
            </div>
          </div>
          <ChartWrapper type="line" data={mockChartData} height={220} />
        </div>

        {/* Pipeline Status */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4">파이프라인 상태</h3>
          <div className="space-y-3">
            {mockPipelineStatus.map((pipe) => (
              <div
                key={pipe.name}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      pipe.status === "active"
                        ? "bg-green-500 animate-pulse"
                        : "bg-gray-300"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {pipe.name}
                    </p>
                    <p className="text-[11px] text-gray-400">{pipe.schedule}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-700">
                  {pipe.count}
                </span>
              </div>
            ))}
          </div>
          <Link
            href={adminHref("/admin/settings")}
            className="block mt-4 text-xs text-[#1A56A8] hover:underline text-center"
          >
            설정 보기
          </Link>
        </div>
      </div>

      {/* Recent Activity + Recent Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4">최근 활동</h3>
          <div className="space-y-3">
            {mockRecentActivity.map((activity, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold ${activity.badgeColor}`}
                    >
                      {activity.badge}
                    </span>
                    <span className="text-sm text-gray-700 truncate">
                      {activity.text}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-400 shrink-0">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">최근 접수</h3>
            <Link
              href={adminHref("/admin/inquiries")}
              className="text-xs text-[#1A56A8] hover:underline"
            >
              전체보기
            </Link>
          </div>
          <div className="space-y-2">
            {mockRecentInquiries.map((inq) => (
              <div
                key={inq.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      inq.type === "general"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-purple-50 text-purple-700"
                    }`}
                  >
                    {inq.type === "general" ? "일반" : "진단"}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {inq.company}
                    </p>
                    <p className="text-xs text-gray-400">{inq.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status={inq.status} />
                  <p className="text-[11px] text-gray-400 mt-0.5">{inq.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
