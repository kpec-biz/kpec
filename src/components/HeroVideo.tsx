"use client";

import Link from "next/link";

const HERO_VIDEO = "/videos/hero/hero-6.mp4";

export default function HeroVideo() {
  return (
    <section className="relative z-[5] w-full min-h-[620px] flex items-center overflow-hidden pt-20 pb-16">
      {/* MP4 Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={HERO_VIDEO} type="video/mp4" />
      </video>

      {/* Gradient Overlay — left darker */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
          {/* Left: Text */}
          <div className="max-w-[620px]">
            <div className="inline-flex items-center gap-2 bg-primary-60/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
              <span className="w-1.5 h-1.5 bg-white rounded-full" />
              성공보수 후불제 · 승인 전 비용 0원
            </div>

            <h1 className="text-[28px] sm:text-[34px] lg:text-[40px] font-bold text-white leading-[1.3] mb-4">
              정책자금, 재무 구조에 맞게
              <br />
              설계해야 승인됩니다
            </h1>

            <p className="text-sm sm:text-base text-white/70 leading-relaxed mb-7 max-w-[520px]">
              업종·재무 현황·자금 용도를 분석해 승인 가능성이 높은 자금을
              선별하고,
              <br className="hidden sm:block" />
              신청부터 실행까지 전 과정을 지원합니다.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center bg-white text-primary-60 font-semibold text-sm px-6 py-3 rounded-lg hover:bg-primary-5 transition-colors"
              >
                무료상담 신청
              </Link>
              <a
                href="tel:01020205312"
                className="inline-flex items-center justify-center border border-white/50 text-white font-semibold text-sm px-6 py-3 rounded-lg hover:border-white hover:bg-white/10 transition-colors gap-2"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.0 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z" />
                </svg>
                전화상담
              </a>
            </div>
          </div>

          {/* Right: Stats */}
          <div className="flex lg:flex-col gap-3 flex-wrap">
            {[
              { value: "4.4조", label: "2026년 총 예산" },
              { value: "2.5%~", label: "정책 기본금리" },
              { value: "15년+", label: "컨설팅 경력" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/8 border border-white/10 rounded-xl px-6 py-4 text-center min-w-[110px] backdrop-blur-sm"
              >
                <div className="text-[26px] font-bold text-white leading-none">
                  {stat.value}
                </div>
                <div className="text-[11px] text-white/50 mt-1.5">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Note */}
      <p className="absolute bottom-2 right-8 text-[10px] text-white/25 z-10">
        AI 생성 영상입니다
      </p>
    </section>
  );
}
