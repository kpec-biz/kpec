"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";

const casesData = [
  {
    id: 1,
    category: "시설자금",
    company: "(주)한성정밀",
    industry: "자동차 부품 제조",
    location: "경기도 화성시",
    fund: "신성장기반자금",
    amount: "15억원",
    rate: "연 2.5% (DX 우대)",
    result: "생산성 35% 향상, 불량률 50% 감소, 매출 40% 성장",
    desc: "기존 수동 생산라인을 IoT 기반 스마트팩토리로 전환. MES 도입 및 로봇 자동화 설비 구축을 통해 인건비 연 2억원 절감, 2년 차에 수출 시장 진출.",
  },
  {
    id: 2,
    category: "운전자금",
    company: "(주)딥인사이트",
    industry: "AI 소프트웨어 개발",
    location: "서울시 강남구",
    fund: "혁신창업사업화자금",
    amount: "3억원",
    rate: "연 2.5% (AI 우대)",
    result: "개발 인력 5명 충원, 솔루션 고도화, 매출 2배 성장",
    desc: "창업 4년차 AI 스타트업. 연구개발 인력 인건비와 서버 인프라 비용을 정책자금으로 조달하여 제품 완성도 향상 및 대기업 파일럿 계약 체결.",
  },
  {
    id: 3,
    category: "인증",
    company: "(주)그린에너지솔루션",
    industry: "신재생에너지",
    location: "충청남도 천안시",
    fund: "이노비즈 인증 + 시설자금",
    amount: "8억원",
    rate: "연 2.3% (인증 우대)",
    result: "이노비즈 인증 취득, 정책자금 우선 배정, 공공조달 수주",
    desc: "이노비즈 인증 취득 후 정책자금 우선 배정 자격 획득. 태양광 설비 증설에 시설자금 8억원 조달하여 발전 용량 3배 확대.",
  },
  {
    id: 4,
    category: "운전자금",
    company: "(주)맛있는제과",
    industry: "식품 제조",
    location: "부산시 사상구",
    fund: "긴급경영안정자금",
    amount: "2억원",
    rate: "연 2.5%",
    result: "원자재 수급 안정화, 생산 정상화, 납기 이행률 95% 회복",
    desc: "원자재 가격 급등으로 인한 운영자금 부족 상황에서 긴급경영안정자금을 활용. 빠른 심사로 3주 내 자금 집행, 납기 위기를 극복하고 거래처 신뢰 회복.",
  },
];

const tabs = ["전체", "운전자금", "시설자금", "인증"];

export default function CasesPage() {
  const [activeTab, setActiveTab] = useState("전체");

  const filtered =
    activeTab === "전체"
      ? casesData
      : casesData.filter((c) => c.category === activeTab);

  return (
    <>
      <PageHeader
        bgImage="/images/headers/cases.png"
        title="성공사례"
        subtitle="다양한 업종의 기업들이 KPEC와 함께 정책자금 조달에 성공한 사례를 소개합니다"
      />

      <section className="py-16 bg-gray-5 min-h-[60vh]">
        <div className="max-w-[1200px] mx-auto px-6">
          {/* 필터 탭 */}
          <div className="flex gap-2 mb-10 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? "bg-primary-60 text-white"
                    : "bg-white text-gray-60 border border-gray-20 hover:border-primary-40 hover:text-primary-60"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-24 text-gray-40">
              <svg
                className="w-16 h-16 mx-auto mb-4 opacity-40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-lg font-medium text-gray-50">
                등록된 사례가 없습니다
              </p>
              <p className="text-sm text-gray-40 mt-2">
                곧 성공사례를 업데이트할 예정입니다
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-xl border border-gray-10 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="bg-primary-80 px-5 py-4">
                    <span className="inline-block bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full mb-2">
                      {c.category}
                    </span>
                    <h3 className="text-lg font-bold text-white">
                      {c.company}
                    </h3>
                    <p className="text-white/70 text-sm">
                      {c.industry} · {c.location}
                    </p>
                  </div>
                  <div className="p-5">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-5 rounded-lg p-3">
                        <p className="text-xs text-gray-50 mb-0.5">활용 자금</p>
                        <p className="text-sm font-semibold text-gray-80">
                          {c.fund}
                        </p>
                      </div>
                      <div className="bg-primary-5 rounded-lg p-3">
                        <p className="text-xs text-gray-50 mb-0.5">대출 금액</p>
                        <p className="text-sm font-bold text-primary-60">
                          {c.amount}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-60 leading-relaxed mb-4">
                      {c.desc}
                    </p>
                    <div className="border-t border-gray-10 pt-3">
                      <p className="text-xs font-semibold text-success uppercase tracking-wide mb-1">
                        성과
                      </p>
                      <p className="text-sm text-gray-70">{c.result}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
