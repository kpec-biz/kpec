"use client";

import { useState } from "react";
import StatsCard from "@/components/admin/StatsCard";
import ChartWrapper from "@/components/admin/ChartWrapper";

const periods = [
  { label: "오늘", days: 1 },
  { label: "7일", days: 7 },
  { label: "14일", days: 14 },
  { label: "30일", days: 30 },
  { label: "90일", days: 90 },
];

// 목업 데이터
const mockAnalyticsStats = {
  visitors: 1243,
  pageviews: 3891,
  avgDuration: "2분 34초",
  bounceRate: "42.3%",
};

const mockTrendData = {
  labels: ["3/15", "3/16", "3/17", "3/18", "3/19", "3/20", "3/21"],
  datasets: [
    {
      label: "방문자",
      data: [180, 220, 195, 240, 210, 170, 130],
      borderColor: "#1A56A8",
      backgroundColor: "rgba(26, 86, 168, 0.08)",
      fill: true,
      tension: 0.4,
    },
    {
      label: "페이지뷰",
      data: [520, 610, 560, 680, 590, 420, 350],
      borderColor: "#10b981",
      backgroundColor: "transparent",
      fill: false,
      tension: 0.4,
    },
  ],
};

const mockTrafficSources = [
  { name: "직접 방문", value: 45, color: "#1A56A8" },
  { name: "검색 엔진", value: 32, color: "#10b981" },
  { name: "소셜 미디어", value: 15, color: "#f59e0b" },
  { name: "기타", value: 8, color: "#9ca3af" },
];

const mockTopPages = [
  { name: "/", views: 1240, percent: 100 },
  { name: "/services", views: 890, percent: 72 },
  { name: "/contact", views: 650, percent: 52 },
  { name: "/cases", views: 420, percent: 34 },
  { name: "/process", views: 310, percent: 25 },
];

const mockDevices = [
  { name: "모바일", value: 62, color: "#1A56A8" },
  { name: "데스크톱", value: 31, color: "#10b981" },
  { name: "태블릿", value: 7, color: "#f59e0b" },
];

const mockReferrers = [
  { name: "google.com", value: 456 },
  { name: "naver.com", value: 321 },
  { name: "daum.net", value: 89 },
  { name: "instagram.com", value: 67 },
  { name: "blog.naver.com", value: 45 },
];

export default function AdminAnalyticsPage() {
  const [activePeriod, setActivePeriod] = useState(7);

  return (
    <div className="space-y-6">
      {/* Period Filter */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-2">
            {periods.map((p) => (
              <button
                key={p.days}
                onClick={() => setActivePeriod(p.days)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activePeriod === p.days
                    ? "bg-[#1A56A8] text-white"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            새로고침
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatsCard
          label="방문자"
          value={mockAnalyticsStats.visitors.toLocaleString()}
          change="+15% 전기간 대비"
          changeType="positive"
          iconBg="#E8EEF6"
          iconColor="#1A56A8"
          icon={
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
        <StatsCard
          label="페이지뷰"
          value={mockAnalyticsStats.pageviews.toLocaleString()}
          change="+22% 전기간 대비"
          changeType="positive"
          iconBg="#d1fae5"
          iconColor="#059669"
          icon={
            <svg
              width="24"
              height="24"
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
          label="평균 체류시간"
          value={mockAnalyticsStats.avgDuration}
          change="+8초 전기간 대비"
          changeType="positive"
          iconBg="#fef3c7"
          iconColor="#d97706"
          icon={
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
        <StatsCard
          label="이탈률"
          value={mockAnalyticsStats.bounceRate}
          change="-3.2% 전기간 대비"
          changeType="positive"
          iconBg="#fee2e2"
          iconColor="#dc2626"
          icon={
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          }
        />
      </div>

      {/* Trend Chart */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-gray-900">트렌드</h3>
            <div className="flex items-center gap-4 mt-1">
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1A56A8]" />
                방문자
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                페이지뷰
              </span>
            </div>
          </div>
        </div>
        <ChartWrapper type="line" data={mockTrendData} height={250} />
      </div>

      {/* Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4">트래픽 소스</h3>
          <div className="space-y-3">
            {mockTrafficSources.map((src) => (
              <div key={src.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: src.color }}
                  />
                  <span className="text-sm text-gray-700">{src.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${src.value}%`,
                        backgroundColor: src.color,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-10 text-right">
                    {src.value}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Referrers */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4">유입 경로</h3>
          <div className="space-y-3">
            {mockReferrers.map((ref, i) => (
              <div key={ref.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-700">{ref.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {ref.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Devices */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4">기기별 사용자</h3>
          <div className="space-y-3">
            {mockDevices.map((device) => (
              <div
                key={device.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: device.color }}
                  />
                  <span className="text-sm text-gray-700">{device.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${device.value}%`,
                        backgroundColor: device.color,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-10 text-right">
                    {device.value}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Pages */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4">인기 페이지</h3>
          <div className="space-y-3">
            {mockTopPages.map((page, i) => (
              <div key={page.name} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700 truncate">
                      {page.name}
                    </span>
                    <span className="text-xs text-gray-400 ml-2 shrink-0">
                      {page.views.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1A56A8] rounded-full"
                      style={{ width: `${page.percent}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
