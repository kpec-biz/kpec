"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const items = [
  "개인사업자 및 법인사업자",
  "업력 1년 이상 기업",
  "창업 3년 이내 기업 (창업자금)",
  "제조업, 서비스업, IT업 등 전 업종",
  "매출 발생 기업 우대",
  "기술력 보유 기업 우대",
];

export default function Eligibility() {
  return (
    <section className="py-20 sm:py-28 bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block bg-accent/20 text-accent px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              자격요건
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              사업자라면 누구나 상담 가능합니다
            </h2>
            <p className="text-gray-400 text-lg mb-12">
              아래 조건에 해당하시면 지금 바로 무료상담을 신청하세요
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4">
            {items.map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl px-5 py-4 border border-white/10"
              >
                <svg
                  className="w-5 h-5 text-accent flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-gray-200 text-sm sm:text-base">
                  {item}
                </span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link
              href="/contact"
              className="inline-block mt-10 bg-accent hover:bg-accent-dark text-primary px-10 py-4 rounded-xl text-lg font-semibold transition-colors"
            >
              무료상담 신청하기
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
