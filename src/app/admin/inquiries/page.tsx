"use client";

import { useState } from "react";
import StatusBadge from "@/components/admin/StatusBadge";

type InquiryType = "all" | "general" | "diagnosis";
type InquiryStatus = "new" | "progress" | "complete";

interface Inquiry {
  id: string;
  type: "general" | "diagnosis";
  date: string;
  company: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  status: InquiryStatus;
  // 일반접수(위자드폼) 추가 필드
  industry?: string;
  revenue?: string;
  amount?: string;
  situations?: string[];
  message?: string;
  // 자금진단 추가 필드
  diagnosisResult?: string;
  matchedFunds?: string[];
}

const mockInquiries: Inquiry[] = [
  {
    id: "INQ-001",
    type: "general",
    date: "2026-03-21 14:32",
    company: "(주)테스트기업",
    name: "홍길동",
    phone: "010-1234-5678",
    email: "hong@test.co.kr",
    location: "서울 강남구",
    status: "new",
    industry: "제조업",
    revenue: "10억~50억",
    amount: "5,000만원",
    situations: ["신규창업", "시설투자"],
    message: "시설자금 관련 상담 요청합니다.",
  },
  {
    id: "INQ-002",
    type: "diagnosis",
    date: "2026-03-21 11:15",
    company: "스타트업A",
    name: "김철수",
    phone: "010-9876-5432",
    email: "kim@startup.io",
    location: "경기 성남시",
    status: "new",
    diagnosisResult: "적격",
    matchedFunds: ["중소기업 정책자금", "기술보증기금"],
  },
  {
    id: "INQ-003",
    type: "general",
    date: "2026-03-20 16:45",
    company: "(주)성공기업",
    name: "이영희",
    phone: "010-5555-6666",
    email: "lee@success.co.kr",
    location: "부산 해운대구",
    status: "progress",
    industry: "IT/소프트웨어",
    revenue: "50억~100억",
    amount: "2억원",
    message: "운전자금 긴급 필요합니다.",
  },
  {
    id: "INQ-004",
    type: "diagnosis",
    date: "2026-03-19 09:20",
    company: "바이오텍코리아",
    name: "박민수",
    phone: "010-3333-4444",
    email: "park@biotech.kr",
    location: "대전 유성구",
    status: "progress",
    diagnosisResult: "적격",
    matchedFunds: ["혁신성장 정책자금", "신성장기반자금"],
  },
  {
    id: "INQ-005",
    type: "general",
    date: "2026-03-18 13:00",
    company: "(주)글로벌무역",
    name: "최정우",
    phone: "010-7777-8888",
    email: "choi@global.co.kr",
    location: "인천 남동구",
    status: "complete",
    industry: "도소매업",
    revenue: "100억 이상",
    amount: "5억원",
  },
  {
    id: "INQ-006",
    type: "diagnosis",
    date: "2026-03-17 10:30",
    company: "친환경에너지",
    name: "정수빈",
    phone: "010-2222-1111",
    email: "jung@eco.kr",
    location: "광주 북구",
    status: "complete",
    diagnosisResult: "부적격",
    matchedFunds: [],
  },
];

const statusTabs: { label: string; value: InquiryStatus | "all" }[] = [
  { label: "전체", value: "all" },
  { label: "신규", value: "new" },
  { label: "진행중", value: "progress" },
  { label: "완료", value: "complete" },
];

const typeTabs: { label: string; value: InquiryType }[] = [
  { label: "전체", value: "all" },
  { label: "일반접수", value: "general" },
  { label: "자금진단", value: "diagnosis" },
];

const statusActions: Record<
  InquiryStatus,
  { next: InquiryStatus; label: string } | null
> = {
  new: { next: "progress", label: "진행중으로" },
  progress: { next: "complete", label: "완료처리" },
  complete: null,
};

export default function AdminInquiriesPage() {
  const [activeStatus, setActiveStatus] = useState<InquiryStatus | "all">(
    "all",
  );
  const [activeType, setActiveType] = useState<InquiryType>("all");
  const [inquiries, setInquiries] = useState(mockInquiries);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = inquiries.filter((inq) => {
    if (activeStatus !== "all" && inq.status !== activeStatus) return false;
    if (activeType !== "all" && inq.type !== activeType) return false;
    return true;
  });

  const counts = {
    all: inquiries.length,
    new: inquiries.filter((i) => i.status === "new").length,
    progress: inquiries.filter((i) => i.status === "progress").length,
    complete: inquiries.filter((i) => i.status === "complete").length,
  };

  const handleStatusChange = (id: string, newStatus: InquiryStatus) => {
    setInquiries((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq)),
    );
  };

  const selected = selectedId
    ? inquiries.find((i) => i.id === selectedId)
    : null;

  return (
    <div className="space-y-6">
      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveStatus(tab.value)}
            className={`p-4 rounded-xl border text-left transition-all ${
              activeStatus === tab.value
                ? "border-[#1A56A8] bg-[#1A56A8]/5"
                : "border-gray-100 bg-white hover:border-gray-200"
            }`}
          >
            <p className="text-sm text-gray-500">{tab.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {counts[tab.value as keyof typeof counts]}
            </p>
          </button>
        ))}
      </div>

      {/* Type Filter */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-2">
          {typeTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveType(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeType === tab.value
                  ? "bg-[#1A56A8] text-white"
                  : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="text-sm text-gray-400">{filtered.length}건</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">
                  유형
                </th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">
                  접수일
                </th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">
                  상호명
                </th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium hidden sm:table-cell">
                  이름
                </th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium hidden md:table-cell">
                  연락처
                </th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium hidden lg:table-cell">
                  지역
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
              {filtered.map((inq) => (
                <tr
                  key={inq.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer"
                  onClick={() => setSelectedId(inq.id)}
                >
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                        inq.type === "general"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-purple-50 text-purple-700"
                      }`}
                    >
                      {inq.type === "general" ? "일반접수" : "자금진단"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                    {inq.date}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {inq.company}
                  </td>
                  <td className="py-3 px-4 text-gray-600 hidden sm:table-cell">
                    {inq.name}
                  </td>
                  <td className="py-3 px-4 text-gray-600 hidden md:table-cell">
                    {inq.phone}
                  </td>
                  <td className="py-3 px-4 text-gray-600 hidden lg:table-cell">
                    {inq.location}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={inq.status} />
                  </td>
                  <td className="py-3 px-4">
                    {statusActions[inq.status] && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(
                            inq.id,
                            statusActions[inq.status]!.next,
                          );
                        }}
                        className="px-2.5 py-1 text-xs font-medium text-[#1A56A8] bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                      >
                        {statusActions[inq.status]!.label}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    접수 내역이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedId(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-gray-900">
                    {selected.company}
                  </h3>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                      selected.type === "general"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-purple-50 text-purple-700"
                    }`}
                  >
                    {selected.type === "general" ? "일반접수" : "자금진단"}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedId(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">이름</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selected.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">연락처</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selected.phone}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">이메일</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selected.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">지역</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selected.location}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">접수일</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selected.date}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">상태</p>
                  <StatusBadge status={selected.status} />
                </div>
              </div>

              {/* 일반접수 추가 정보 */}
              {selected.type === "general" && (
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    위자드폼 정보
                  </p>
                  {selected.industry && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">업종</span>
                      <span className="text-sm text-gray-900">
                        {selected.industry}
                      </span>
                    </div>
                  )}
                  {selected.revenue && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">연매출</span>
                      <span className="text-sm text-gray-900">
                        {selected.revenue}
                      </span>
                    </div>
                  )}
                  {selected.amount && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">필요자금</span>
                      <span className="text-sm text-gray-900">
                        {selected.amount}
                      </span>
                    </div>
                  )}
                  {selected.situations && selected.situations.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">상황</span>
                      <span className="text-sm text-gray-900">
                        {selected.situations.join(", ")}
                      </span>
                    </div>
                  )}
                  {selected.message && (
                    <div>
                      <span className="text-sm text-gray-500">문의내용</span>
                      <p className="text-sm text-gray-900 mt-1 bg-gray-50 rounded-lg p-3">
                        {selected.message}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 자금진단 추가 정보 */}
              {selected.type === "diagnosis" && (
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    자금진단 결과
                  </p>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">진단결과</span>
                    <span
                      className={`text-sm font-medium ${
                        selected.diagnosisResult === "적격"
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      {selected.diagnosisResult}
                    </span>
                  </div>
                  {selected.matchedFunds &&
                    selected.matchedFunds.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-500">매칭 자금</span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {selected.matchedFunds.map((fund) => (
                            <span
                              key={fund}
                              className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium"
                            >
                              {fund}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-100 flex gap-3">
              {statusActions[selected.status] && (
                <button
                  onClick={() => {
                    handleStatusChange(
                      selected.id,
                      statusActions[selected.status]!.next,
                    );
                  }}
                  className="flex-1 py-2.5 bg-[#1A56A8] text-white rounded-xl text-sm font-medium hover:bg-[#134A8A] transition-colors"
                >
                  {statusActions[selected.status]!.label}
                </button>
              )}
              <a
                href={`tel:${selected.phone.replace(/-/g, "")}`}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors text-center"
              >
                전화하기
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
