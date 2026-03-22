"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import ScrollReveal from "@/components/ScrollReveal";
import { r2 } from "@/lib/r2-images";

const faqData = [
  {
    q: "정책자금은 누가 신청할 수 있나요?",
    a: "중소기업기본법 제2조에 따른 중소기업이면 신청 가능합니다. 다만, 유가증권·코스닥 상장사, 자본금 200억원 또는 자산 700억원 초과 기업, 세금 체납 기업, 휴·폐업 중인 기업 등은 제외됩니다.",
  },
  {
    q: "정책자금 금리는 얼마인가요?",
    a: "2026년 기준 정책자금 기본 금리는 연 2.5% 수준이며, 자금 유형에 따라 연 1.9%~4.5%까지 차등 적용됩니다. 비수도권(-0.2%p), DX·ESG 기업(최대 -0.3%p), AI 기업(-0.1%p) 등 우대금리가 추가 적용될 수 있습니다.",
  },
  {
    q: "기업당 최대 얼마까지 대출받을 수 있나요?",
    a: "기업당 융자한도는 운전자금+시설자금 합산 60억원 이내입니다. AX 스프린트 우대트랙(AI 기업)에 선정되면 100억원까지 가능합니다. 운전자금 단독은 일반적으로 5억원 이내입니다.",
  },
  {
    q: "운전자금과 시설자금의 차이는 무엇인가요?",
    a: "운전자금은 인건비, 원자재 구매 등 일상적인 경영활동 비용에 사용하며 상환기간 5년 이내(거치 2년)입니다. 시설자금은 기계·설비 도입, 공장 건축·확장 등에 사용하며 상환기간 10년 이내(거치 3~4년)로 더 깁니다.",
  },
  {
    q: "벤처기업 인증을 받으면 정책자금에서 유리한가요?",
    a: "네, 벤처기업·이노비즈·메인비즈 인증 기업은 정책자금 신청 시 우선 배정 및 가점을 받습니다. 특히 벤처기업은 법인세·소득세 50% 감면, 기보 보증 우대, R&D 가점 등 다양한 추가 혜택도 받을 수 있습니다.",
  },
];

const certTypes = [
  {
    name: "벤처기업",
    items: [
      { label: "핵심 요건", value: "투자금 5천만원 이상 또는 기술평가" },
      { label: "업력 요건", value: "제한 없음" },
      { label: "유효기간", value: "3년" },
      { label: "세제 혜택", value: "법인세·소득세 50% 감면 (5년)" },
      { label: "정책자금", value: "우선 배정·가점" },
      { label: "보증 우대", value: "기보 보증 우대" },
      { label: "기타", value: "병역특례, 스톡옵션 확대" },
    ],
  },
  {
    name: "이노비즈",
    items: [
      { label: "핵심 요건", value: "기술혁신역량 700점 이상" },
      { label: "업력 요건", value: "3년 이상 (벤처 1년)" },
      { label: "유효기간", value: "3년" },
      { label: "세제 혜택", value: "없음" },
      { label: "정책자금", value: "우선 배정" },
      { label: "보증 우대", value: "보증료 -0.2%p" },
      { label: "기타", value: "공공조달 가점" },
    ],
  },
  {
    name: "메인비즈",
    items: [
      { label: "핵심 요건", value: "경영혁신 700점 이상" },
      { label: "업력 요건", value: "3년 이상" },
      { label: "유효기간", value: "3년" },
      { label: "세제 혜택", value: "없음" },
      { label: "정책자금", value: "융자한도 70억" },
      { label: "보증 우대", value: "보증료 -0.1%p" },
      { label: "기타", value: "컨설팅·판로 지원" },
    ],
  },
  {
    name: "ISO",
    items: [
      { label: "핵심 요건", value: "품질/환경경영시스템 구축" },
      { label: "업력 요건", value: "제한 없음" },
      { label: "유효기간", value: "3년 (매년 사후심사)" },
      { label: "세제 혜택", value: "없음" },
      { label: "정책자금", value: "일부 가점" },
      { label: "보증 우대", value: "해당 없음" },
      { label: "기타", value: "공공입찰 가점" },
    ],
  },
];

function CertCardsMobile() {
  const [active, setActive] = useState(0);
  const cert = certTypes[active];

  return (
    <div className="md:hidden">
      {/* 탭 뱃지 */}
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {certTypes.map((c, i) => (
          <button
            key={c.name}
            onClick={() => setActive(i)}
            className={`py-2 px-1 rounded-lg text-[12px] font-semibold text-center transition-all ${
              active === i
                ? "bg-primary-60 text-white"
                : "bg-white border border-gray-10 text-gray-60"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* 상세 카드 */}
      <div className="bg-white border border-gray-10 rounded-xl overflow-hidden">
        {cert.items.map((item, i) => (
          <div
            key={item.label}
            className={`flex items-start gap-3 px-4 py-2.5 ${i % 2 === 1 ? "bg-gray-5" : ""}`}
          >
            <span className="text-[11px] font-semibold text-gray-50 w-16 flex-shrink-0 pt-0.5">
              {item.label}
            </span>
            <span className="text-[13px] text-gray-80">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-10 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 text-left bg-white hover:bg-gray-5 transition-colors"
      >
        <span className="text-[13px] sm:text-base font-semibold text-gray-90">
          {q}
        </span>
        <svg
          className={`w-5 h-5 text-gray-50 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-5 text-[13px] sm:text-base text-gray-70 leading-relaxed border-t border-gray-10">
          {a}
        </div>
      )}
    </div>
  );
}

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        bgImage="/images/headers/services.png"
        title="정책자금 안내"
        subtitle="중소기업을 위한 운전자금·시설자금·기업인증 정책자금 종합 안내"
      />

      {/* 운전자금 */}
      <ScrollReveal>
        <section
          className="py-16 relative"
          style={{
            backgroundImage: `url(${r2("/images/services/operating-fund-bg.png")})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-white/[0.95]" />
          <div className="relative z-10 max-w-[1200px] mx-auto px-6">
            <div className="mb-10">
              <span className="inline-block bg-primary-5 text-primary-60 text-sm font-semibold px-3 py-1 rounded-full mb-3">
                01
              </span>
              <h2 className="text-2xl font-bold text-gray-90 mb-2">운전자금</h2>
              <p className="text-gray-50">
                인건비, 원자재 구매, 경영활동 비용 등 일상적인 운영에 필요한
                자금
              </p>
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-primary-80 text-white">
                    <th className="px-5 py-3 text-left font-semibold">구분</th>
                    <th className="px-5 py-3 text-left font-semibold">내용</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["대상", "중소기업기본법 제2조에 따른 중소기업"],
                    ["용도", "인건비, 원자재 구매, 운영비 등 경영활동 전반"],
                    ["기본 금리", "연 2.5% (DX·ESG 우대 시 최대 -0.3%p)"],
                    ["한도", "기업당 5억원 이내 (수출기업화 자금 최대 10억원)"],
                    ["기간", "5년 이내 (거치기간 2년 이내)"],
                    ["상환", "원금균등 분할상환 (거치기간 중 이자만 납부)"],
                  ].map(([label, value], i) => (
                    <tr
                      key={label}
                      className={i % 2 === 0 ? "bg-white" : "bg-gray-5"}
                    >
                      <td className="px-5 py-3 font-medium text-gray-70 w-40">
                        {label}
                      </td>
                      <td className="px-5 py-3 text-gray-80">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {[
                {
                  name: "혁신창업사업화자금",
                  target: "창업 7년 미만",
                  budget: "1.6조원",
                },
                {
                  name: "신시장진출지원자금",
                  target: "수출·내수 성장 기업",
                  budget: "1.7조원",
                },
                {
                  name: "긴급경영안정자금",
                  target: "경영위기 기업",
                  budget: "0.25조원",
                },
                {
                  name: "청년전용창업자금",
                  target: "만 39세 이하",
                  budget: "1~2억원",
                },
                {
                  name: "일반경영안정자금",
                  target: "소상공인",
                  budget: "연 7천만원",
                },
                {
                  name: "신성장기반자금",
                  target: "성장기 중소기업",
                  budget: "별도 배정",
                },
              ].map((p) => (
                <div
                  key={p.name}
                  className="bg-primary-5 rounded-lg p-3 sm:p-4 border border-primary-10"
                >
                  <p className="text-[12px] sm:text-base font-semibold text-primary-70 mb-0.5 sm:mb-1">
                    {p.name}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-60">
                    {p.target} · {p.budget}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>
      {/* 시설자금 */}
      <ScrollReveal>
        <section
          className="py-16 relative"
          style={{
            backgroundImage: `url(${r2("/images/services/facility-fund-bg.png")})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gray-5/[0.95]" />
          <div className="relative z-10 max-w-[1200px] mx-auto px-6">
            <div className="mb-10">
              <span className="inline-block bg-primary-10 text-primary-60 text-sm font-semibold px-3 py-1 rounded-full mb-3">
                02
              </span>
              <h2 className="text-2xl font-bold text-gray-90 mb-2">시설자금</h2>
              <p className="text-gray-50">
                공장 신축·확장, 설비 도입, 토지 구매 등 고정자산 투자를 위한
                장기 저금리 자금
              </p>
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-primary-70 text-white">
                    <th className="px-5 py-3 text-left font-semibold">구분</th>
                    <th className="px-5 py-3 text-left font-semibold">내용</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["대상", "시설투자 계획서 제출 가능한 중소기업"],
                    [
                      "용도",
                      "사업장 건축, 토지 구매, 생산설비, 시험검사 장비 도입",
                    ],
                    ["기본 금리", "연 2.5% 내외 (AX 스프린트 우대 -0.1%p)"],
                    [
                      "한도",
                      "기업당 60억원 이내 (운전+시설 합산, AI기업 100억원)",
                    ],
                    ["기간", "10년 이내 (담보 거치 4년, 신용 거치 3년)"],
                    ["상환", "원금균등 분할상환"],
                  ].map(([label, value], i) => (
                    <tr
                      key={label}
                      className={i % 2 === 0 ? "bg-white" : "bg-gray-5"}
                    >
                      <td className="px-5 py-3 font-medium text-gray-70 w-40">
                        {label}
                      </td>
                      <td className="px-5 py-3 text-gray-80">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </ScrollReveal>
      {/* 기업인증 비교표 */}
      <ScrollReveal>
        <section
          className="py-16 relative"
          style={{
            backgroundImage: `url(${r2("/images/services/certification-bg.png")})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-white/[0.95]" />
          <div className="relative z-10 max-w-[1200px] mx-auto px-6">
            <div className="mb-10">
              <span className="inline-block bg-primary-5 text-primary-60 text-sm font-semibold px-3 py-1 rounded-full mb-3">
                03
              </span>
              <h2 className="text-2xl font-bold text-gray-90 mb-2">
                기업인증 컨설팅
              </h2>
              <p className="text-[13px] sm:text-base text-gray-50">
                인증 취득으로 정책자금 우선배정
                <br className="sm:hidden" />및 세제 혜택을 누리세요
              </p>
            </div>
            {/* Desktop: 기존 표 */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-primary-80 text-white">
                    <th className="px-5 py-3 text-left font-semibold">구분</th>
                    <th className="px-5 py-3 text-center font-semibold">
                      벤처기업
                    </th>
                    <th className="px-5 py-3 text-center font-semibold">
                      이노비즈
                    </th>
                    <th className="px-5 py-3 text-center font-semibold">
                      메인비즈
                    </th>
                    <th className="px-5 py-3 text-center font-semibold">
                      ISO 9001/14001
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    [
                      "핵심 요건",
                      "투자금 5천만원 이상 또는 기술평가",
                      "기술혁신역량 700점 이상",
                      "경영혁신 700점 이상",
                      "품질/환경경영시스템 구축",
                    ],
                    [
                      "업력 요건",
                      "제한 없음",
                      "3년 이상 (벤처기업 1년)",
                      "3년 이상",
                      "제한 없음",
                    ],
                    ["유효기간", "3년", "3년", "3년", "3년 (매년 사후심사)"],
                    [
                      "세제 혜택",
                      "법인세·소득세 50% 감면 (5년)",
                      "없음",
                      "없음",
                      "없음",
                    ],
                    [
                      "정책자금 우대",
                      "우선 배정·가점",
                      "우선 배정",
                      "융자한도 70억",
                      "일부 가점",
                    ],
                    [
                      "보증 우대",
                      "기보 보증 우대",
                      "보증료 -0.2%p",
                      "보증료 -0.1%p",
                      "해당 없음",
                    ],
                    [
                      "기타 혜택",
                      "병역특례, 스톡옵션 확대",
                      "공공조달 가점",
                      "컨설팅·판로 지원",
                      "공공입찰 가점",
                    ],
                  ].map(([label, ...values], i) => (
                    <tr
                      key={label}
                      className={i % 2 === 0 ? "bg-white" : "bg-gray-5"}
                    >
                      <td className="px-5 py-3 font-medium text-gray-70">
                        {label}
                      </td>
                      {values.map((v, j) => (
                        <td
                          key={j}
                          className="px-5 py-3 text-gray-80 text-center"
                        >
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: 탭 카드형 */}
            <CertCardsMobile />
          </div>
        </section>
      </ScrollReveal>
      {/* FAQ */}
      <ScrollReveal>
        <section className="py-16 bg-gray-5">
          <div className="max-w-[800px] mx-auto px-6">
            <h2 className="text-2xl font-bold text-gray-90 mb-8 text-center">
              자주 묻는 질문
            </h2>
            <div className="space-y-3">
              {faqData.map((item, i) => (
                <FaqItem key={i} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>
    </>
  );
}
