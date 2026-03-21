"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const cases = [
  {
    industry: "자동차 부품 제조업",
    type: "시설자금 (신성장기반)",
    amount: "15억원",
    result: "스마트팩토리 전환으로 생산성 35% 향상",
    detail:
      "기존 수동 생산라인을 IoT 기반 스마트팩토리로 전환하고 MES 및 로봇 자동화 설비를 구축했습니다. DX 우대금리(연 2.5%) 적용으로 불량률 50% 감소, 인건비 연 2억원 절감을 달성하며 2년 차에 매출 40% 성장과 수출 시장 진출에 성공했습니다.",
  },
  {
    industry: "AI 소프트웨어 개발",
    type: "운전자금 (혁신창업사업화)",
    amount: "3억원",
    result: "AI 비전검사 솔루션 출시 1년 만에 매출 12억원",
    detail:
      "AX 스프린트 우대금리(연 2.4%)로 핵심 개발인력 채용 및 GPU 서버 인프라를 구축했습니다. 제조업체 대상 AI 비전검사 솔루션을 출시하여 1년 만에 매출 12억원을 달성하고, 벤처기업 인증 후 시리즈A 투자 30억원 유치에 성공했습니다.",
  },
  {
    industry: "건강식품 제조·가공",
    type: "운전자금 + 시설자금",
    amount: "15억원",
    result: "HACCP·ISO 인증 취득 후 동남아 수출 개시",
    detail:
      "비수도권·ESG 우대금리(연 2.3%)로 HACCP·ISO 22000 인증을 취득하고 동남아 수출용 생산라인을 증설했습니다. 운전자금으로 해외 바이어 발굴 마케팅 비용을 충당하여 베트남·태국 수출을 개시, 수출 매출 비중 30%를 달성했습니다.",
  },
  {
    industry: "카페·베이커리 (소상공인)",
    type: "일반경영안정자금",
    amount: "7천만원",
    result: "온라인 전환으로 월 매출 150% 증가",
    detail:
      "소진공 직접대출(연 2.96%)로 인테리어 리뉴얼과 온라인 주문 시스템을 도입했습니다. 키오스크 설치 및 배달 플랫폼 입점으로 온라인 주문 비중이 40%로 확대되었고, 월 매출이 150% 증가하여 2호점 오픈을 계획 중입니다.",
  },
];

export default function Cases() {
  const [active, setActive] = useState(0);

  return (
    <section className="py-20 sm:py-28 bg-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-accent/10 text-accent-dark px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            성공사례
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-dark mb-4">
            고객사의 성공이 우리의 성과입니다
          </h2>
          <p className="text-gray-500 text-lg">
            다양한 업종의 기업들이 KPEC와 함께 성장하고 있습니다
          </p>
        </motion.div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {cases.map((c, i) => (
            <button
              key={c.industry}
              onClick={() => setActive(i)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                active === i
                  ? "bg-dark text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-dark/5 border border-gray-200"
              }`}
            >
              {c.industry}
            </button>
          ))}
        </div>

        {/* Active Case Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-3xl mx-auto rounded-2xl border border-accent/20 bg-white p-8 sm:p-10 shadow-sm"
          >
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="text-sm font-semibold px-3 py-1 rounded-full bg-navy/10 text-navy">
                {cases[active].type}
              </span>
              <span className="text-sm font-semibold px-3 py-1 rounded-full bg-accent/10 text-accent-dark">
                {cases[active].amount}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-dark mb-3">
              {cases[active].result}
            </h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              {cases[active].detail}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
