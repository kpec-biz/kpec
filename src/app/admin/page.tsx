"use client";

import { useState } from "react";
import Link from "next/link";
import ChartWrapper from "@/components/admin/ChartWrapper";
import StatusBadge from "@/components/admin/StatusBadge";
import { adminPath } from "@/lib/admin-utils";

const mockStats = [
  {
    label: "전체 접수",
    value: 47,
    sub: "신규 5건",
    color: "#1A56A8",
    bg: "#E8EEF6",
  },
  {
    label: "신규 접수",
    value: 5,
    sub: "금일",
    color: "#ED2939",
    bg: "#FEE2E2",
  },
  {
    label: "게시 공고",
    value: 12,
    sub: "활성",
    color: "#059669",
    bg: "#D1FAE5",
  },
  {
    label: "게시 뉴스",
    value: 8,
    sub: "활성",
    color: "#7c3aed",
    bg: "#EDE9FE",
  },
  {
    label: "분석 리포트",
    value: 4,
    sub: "게시중",
    color: "#d97706",
    bg: "#FEF3C7",
  },
  {
    label: "인스타 게재",
    value: 15,
    sub: "총 게시물",
    color: "#db2777",
    bg: "#FCE7F3",
  },
];

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
      borderColor: "#ED2939",
      backgroundColor: "transparent",
      fill: false,
      tension: 0.4,
    },
  ],
};

const mockRecentActivity = [
  {
    badge: "일반접수",
    badgeColor: "bg-[#E8EEF6] text-[#1A56A8]",
    text: "(주)테스트기업 - 홍길동",
    time: "14분 전",
  },
  {
    badge: "자금진단",
    badgeColor: "bg-purple-100 text-purple-700",
    text: "스타트업A - 김철수",
    time: "2시간 전",
  },
  {
    badge: "공고 게시",
    badgeColor: "bg-emerald-100 text-emerald-700",
    text: "2026년 상반기 중소기업 정책자금 안내",
    time: "3시간 전",
  },
  {
    badge: "뉴스 게시",
    badgeColor: "bg-amber-100 text-amber-700",
    text: "중소벤처기업부, 2026년 정책자금 3조원 편성",
    time: "5시간 전",
  },
  {
    badge: "인스타 게재",
    badgeColor: "bg-pink-100 text-pink-700",
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
    color: "#1A56A8",
  },
  {
    name: "뉴스 수집",
    status: "active",
    count: 8,
    schedule: "주 3회",
    color: "#059669",
  },
  {
    name: "분석 리포트",
    status: "active",
    count: 4,
    schedule: "수동",
    color: "#7c3aed",
  },
  {
    name: "인스타 배너",
    status: "active",
    count: 15,
    schedule: "수동/예약",
    color: "#db2777",
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
        {mockStats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
            style={{ borderLeft: `4px solid ${stat.color}` }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#0e2a5c]/50">
              {stat.label}
            </p>
            <p
              className="text-2xl font-bold mt-1"
              style={{ color: stat.color }}
            >
              {stat.value}
            </p>
            <p className="text-[11px] mt-0.5 font-medium text-[#0e2a5c]/40">
              {stat.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Charts + Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#1A56A8]/10 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-[#0e2a5c]">주간 현황</h3>
              <div className="flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1.5 text-xs text-[#1A56A8]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1A56A8]" />
                  방문자
                </span>
                <span className="flex items-center gap-1.5 text-xs text-[#ED2939]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ED2939]" />
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
                      : "text-[#1A56A8] bg-[#E8EEF6] hover:bg-[#1A56A8]/20"
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
        <div className="bg-white rounded-2xl border border-[#1A56A8]/10 p-6 shadow-sm">
          <h3 className="font-bold text-[#0e2a5c] mb-4">파이프라인 상태</h3>
          <div className="space-y-3">
            {mockPipelineStatus.map((pipe) => (
              <div
                key={pipe.name}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ backgroundColor: pipe.color + "0D" }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full animate-pulse"
                    style={{ backgroundColor: pipe.color }}
                  />
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: pipe.color }}
                    >
                      {pipe.name}
                    </p>
                    <p
                      className="text-[11px]"
                      style={{ color: pipe.color + "80" }}
                    >
                      {pipe.schedule}
                    </p>
                  </div>
                </div>
                <span
                  className="text-lg font-bold"
                  style={{ color: pipe.color }}
                >
                  {pipe.count}
                </span>
              </div>
            ))}
          </div>
          <Link
            href={adminPath("settings")}
            className="block mt-4 text-xs text-[#1A56A8] font-medium hover:underline text-center"
          >
            설정 보기
          </Link>
        </div>
      </div>

      {/* Recent Activity + Recent Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-[#1A56A8]/10 p-6 shadow-sm">
          <h3 className="font-bold text-[#0e2a5c] mb-4">최근 활동</h3>
          <div className="space-y-3">
            {mockRecentActivity.map((activity, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1A56A8] shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold ${activity.badgeColor}`}
                    >
                      {activity.badge}
                    </span>
                    <span className="text-sm text-[#0e2a5c] truncate">
                      {activity.text}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-[#1A56A8]/50 shrink-0 font-medium">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="bg-white rounded-2xl border border-[#1A56A8]/10 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#0e2a5c]">최근 접수</h3>
            <Link
              href={adminPath("inquiries")}
              className="text-xs text-[#1A56A8] font-medium hover:underline"
            >
              전체보기
            </Link>
          </div>
          <div className="space-y-2">
            {mockRecentInquiries.map((inq) => (
              <div
                key={inq.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-[#E8EEF6]/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      inq.type === "general"
                        ? "bg-[#E8EEF6] text-[#1A56A8]"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {inq.type === "general" ? "일반" : "진단"}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#0e2a5c]">
                      {inq.company}
                    </p>
                    <p className="text-xs text-[#1A56A8]/60">{inq.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status={inq.status} />
                  <p className="text-[11px] text-[#1A56A8]/40 mt-0.5">
                    {inq.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
