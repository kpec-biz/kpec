"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const steps = [
  { num: "01", title: "초기 상담", desc: "업종·매출·자금 용도 파악" },
  { num: "02", title: "현황 분석", desc: "재무제표·신용등급 기반 적격 심사" },
  { num: "03", title: "자금 설계", desc: "자금종류·금리·한도 최적 조합 제안" },
  { num: "04", title: "계약 체결", desc: "성공보수 후불제 계약 (선불 없음)" },
  { num: "05", title: "전담 배정", desc: "업종 전문 컨설턴트 1:1 배정" },
  { num: "06", title: "신청 지원", desc: "서류 준비 가이드 및 접수 지원" },
  { num: "07", title: "승인 확정", desc: "심사 결과 확인 및 자금 실행 안내" },
  { num: "08", title: "사후 관리", desc: "추가 자금·인증 연계 지속 관리" },
];

/* Mobile: 4x2 badge grid + detail card */
function MobileProcessSteps() {
  const [active, setActive] = useState(0);
  const step = steps[active];

  return (
    <div className="lg:hidden">
      {/* 4x2 Badge Grid */}
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {steps.map((s, i) => (
          <button
            key={s.num}
            onClick={() => setActive(i)}
            className={`py-2 px-1 rounded-lg text-center transition-all duration-200 ${
              active === i
                ? "bg-primary-60 text-white shadow-sm"
                : "bg-white border border-gray-10 text-gray-60"
            }`}
          >
            <div
              className={`text-[10px] font-bold ${active === i ? "text-white/70" : "text-gray-40"}`}
            >
              {s.num}
            </div>
            <div className="text-[11px] font-semibold whitespace-nowrap">
              {s.title}
            </div>
          </button>
        ))}
      </div>

      {/* Detail Card */}
      <motion.div
        key={active}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white border border-gray-10 rounded-xl p-4 text-center"
      >
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary-5 text-primary-60 text-sm font-bold mb-2">
          {step.num}
        </div>
        <div className="text-[15px] font-bold text-gray-90 mb-1">
          {step.title}
        </div>
        <div className="text-[13px] text-gray-50">{step.desc}</div>
      </motion.div>
    </div>
  );
}

export default function ProcessSteps() {
  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Mobile: 4x2 badge + detail */}
      <MobileProcessSteps />

      {/* Desktop: grid */}
      <div className="hidden lg:grid grid-cols-4 gap-3">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="bg-gray-0 border border-gray-10 rounded-lg p-4 text-center hover:border-primary-50 transition-colors duration-200"
          >
            <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary-5 text-primary-60 text-xs font-bold mb-1.5">
              {step.num}
            </div>
            <div className="text-[14px] font-bold text-gray-90 mb-0.5">
              {step.title}
            </div>
            <div className="text-[11px] text-gray-40">{step.desc}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
