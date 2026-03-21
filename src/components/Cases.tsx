"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const cases = [
  {
    industry: "자동차부품 제조업",
    type: "운전자금",
    amount: "5억원",
    result: "기존 대출 대비 금리 2.3% 절감",
    detail:
      "고금리 시중은행 대출을 정책자금으로 전환하여 연간 약 1,150만원의 이자 비용을 절감했습니다.",
  },
  {
    industry: "식품가공 유통업",
    type: "시설자금",
    amount: "8억원",
    result: "신규 생산라인 구축 완료",
    detail:
      "HACCP 인증 생산시설 확장을 위한 시설자금을 확보하여 생산량 200% 증가를 달성했습니다.",
  },
  {
    industry: "AI 소프트웨어 스타트업",
    type: "창업자금",
    amount: "3억원",
    result: "벤처인증 + R&D 자금 동시 확보",
    detail:
      "벤처기업 인증과 함께 기술개발 자금을 동시에 확보하여 제품 출시 일정을 앞당겼습니다.",
  },
  {
    industry: "정밀기계장비 제조업",
    type: "시설자금 + 인증",
    amount: "12억원",
    result: "ISO 인증 취득 + 수출 자금 확보",
    detail:
      "ISO 9001 인증 취득 후 수출 지원 정책자금까지 연계하여 해외 시장 진출에 성공했습니다.",
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
