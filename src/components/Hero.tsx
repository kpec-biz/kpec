"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-[600px] sm:min-h-[700px] flex items-center bg-gradient-to-br from-dark via-dark-light to-primary-light overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Decorative Elements */}
      <div className="absolute -right-32 -top-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 sm:py-40">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 bg-accent/10 backdrop-blur-sm border border-accent/20 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-accent/90 text-sm font-medium">
              후불제 성공보수 &middot; 무료상담
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            귀사의 비즈니스 가치,
            <br />
            <span className="text-accent">정확한 분석</span>에서 시작됩니다
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-2xl leading-relaxed">
            KPEC 기업정책자금센터는 중소기업 맞춤형 정책자금 컨설팅으로
            <br className="hidden sm:block" />
            자금 조달의 새로운 기준을 만들어갑니다.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/contact"
              className="bg-accent hover:bg-accent-dark text-primary px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:shadow-lg hover:shadow-accent/25 text-center"
            >
              무료상담 신청하기
            </Link>
            <a
              href="tel:01084176800"
              className="border-2 border-accent/40 hover:border-accent text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all text-center flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              전화상담
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
