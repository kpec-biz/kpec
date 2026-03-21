"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

/* ───── CountUp (소수점 지원) ───── */
function CountUp({
  end,
  suffix = "",
  decimal = 0,
  duration = 1.2,
}: {
  end: number;
  suffix?: string;
  decimal?: number;
  duration?: number;
}) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (!inView) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) {
      setDisplay(decimal > 0 ? end.toFixed(decimal) : end.toLocaleString());
      return;
    }

    const startTime = performance.now();
    const ms = duration * 1000;

    function easeOutCubic(t: number) {
      return 1 - Math.pow(1 - t, 3);
    }

    function tick(now: number) {
      const progress = Math.min((now - startTime) / ms, 1);
      const value = end * easeOutCubic(progress);
      setDisplay(
        decimal > 0
          ? value.toFixed(decimal)
          : Math.round(value).toLocaleString(),
      );
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [inView, end, decimal, duration]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

/* ───── ProgressBar ───── */
function ProgressBar({
  percent,
  color,
  delay = 0,
}: {
  percent: number;
  color: "red" | "green";
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const timer = setTimeout(() => setWidth(percent), delay);
    return () => clearTimeout(timer);
  }, [inView, percent, delay]);

  const gradient =
    color === "red"
      ? "from-red-600 to-red-400"
      : "from-emerald-600 to-emerald-400";

  return (
    <div
      ref={ref}
      className="h-2.5 bg-white/[0.06] rounded-full overflow-hidden"
    >
      <div
        className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-[1200ms] ease-out`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

/* ───── 애니메이션 Variants ───── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const slideLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0 },
};

const slideRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 },
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 200, damping: 20 },
  },
};

/* ───── 메인 컴포넌트 ───── */
export default function PolicyCompare() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#041530] via-[#0b2a5e] to-[#0b50d0] py-20 sm:py-28">
      {/* 배경 패턴 */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute -right-40 -top-40 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute -left-32 -bottom-32 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── 타이틀 ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14 sm:mb-16"
        >
          <span className="inline-block bg-white/10 border border-white/15 text-white/80 text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full mb-5 tracking-wide">
            2026년 3월 기준
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-[2.5rem] font-extrabold text-white leading-snug mb-3">
            같은 <span className="text-amber-400">1억원</span>
            , 어디서 빌리느냐에 따라
            <br className="hidden sm:block" />
            이자가 <span className="text-amber-400">803만원</span> 달라집니다
          </h2>
          <p className="text-sm sm:text-base text-white/50 max-w-xl mx-auto">
            시중은행 대출과 정부 정책자금, 실제 금액으로 비교해보세요
          </p>
        </motion.div>

        {/* ── 금리 비교 카드 ── */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-5 md:gap-6 items-stretch mb-12">
          {/* 시중은행 */}
          <motion.div
            variants={slideLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="bg-red-500/[0.07] border border-red-500/20 rounded-2xl p-7 sm:p-8"
          >
            <p className="text-red-400 text-xs sm:text-sm font-bold mb-4 tracking-wide">
              시중은행 중소기업 대출
            </p>
            <div className="text-5xl sm:text-6xl font-black text-white leading-none mb-1">
              <CountUp end={5.5} suffix="%" decimal={1} />
            </div>
            <p className="text-white/35 text-xs mb-5">
              신용대출 평균 (4.5~6.5%)
            </p>
            <div className="bg-black/30 rounded-xl p-4">
              <p className="text-red-400 text-xs font-semibold mb-1">
                5년간 총 이자
              </p>
              <div className="text-2xl sm:text-3xl font-black text-red-400">
                <CountUp end={1448} suffix="만원" />
              </div>
            </div>
            <p className="text-white/25 text-[11px] mt-3">
              원리금 균등상환 기준
            </p>
          </motion.div>

          {/* VS */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex items-center justify-center text-white/15 font-black text-xl md:text-2xl"
          >
            VS
          </motion.div>

          {/* 정책자금 */}
          <motion.div
            variants={slideRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="bg-emerald-500/[0.06] border border-emerald-500/20 rounded-2xl p-7 sm:p-8"
          >
            <p className="text-emerald-400 text-xs sm:text-sm font-bold mb-4 tracking-wide">
              정부 정책자금
            </p>
            <div className="text-5xl sm:text-6xl font-black text-white leading-none mb-1">
              <CountUp end={2.5} suffix="%" decimal={1} />
            </div>
            <p className="text-white/35 text-xs mb-5">
              고정금리 (중진공 2026년)
            </p>
            <div className="bg-black/30 rounded-xl p-4">
              <p className="text-emerald-400 text-xs font-semibold mb-1">
                5년간 총 이자
              </p>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                <CountUp end={645} suffix="만원" />
              </div>
            </div>
            <p className="text-white/25 text-[11px] mt-3">
              원리금 균등상환 기준
            </p>
          </motion.div>
        </div>

        {/* ── 절감 하이라이트 ── */}
        <motion.div
          variants={scaleUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="flex justify-center mb-12"
        >
          <div className="inline-block bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 border border-emerald-500/25 rounded-2xl px-10 sm:px-14 py-7 text-center">
            <div className="text-4xl sm:text-5xl lg:text-[3.5rem] font-black text-emerald-400 leading-none mb-1">
              -<CountUp end={803} suffix="만원" />
            </div>
            <p className="text-white/45 text-sm sm:text-base">
              같은 1억, 같은 5년. 금리 하나로 이만큼 차이납니다
            </p>
          </div>
        </motion.div>

        {/* ── 프로그레스 바 비교 ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="max-w-lg mx-auto mb-14 space-y-4"
        >
          <div>
            <div className="flex justify-between text-xs sm:text-sm mb-1.5">
              <span className="text-white/50 font-semibold">시중은행 이자</span>
              <span className="text-red-400 font-extrabold">1,448만원</span>
            </div>
            <ProgressBar percent={100} color="red" delay={200} />
          </div>
          <div>
            <div className="flex justify-between text-xs sm:text-sm mb-1.5">
              <span className="text-white/50 font-semibold">정책자금 이자</span>
              <span className="text-emerald-400 font-extrabold">645만원</span>
            </div>
            <ProgressBar percent={44.5} color="green" delay={500} />
          </div>
        </motion.div>

        {/* ── 폐업 시 비교 ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <h3 className="text-center text-lg sm:text-xl font-bold text-white mb-5">
            만약 사업이 어려워진다면?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 시중은행 */}
            <div className="bg-red-500/[0.05] border border-red-500/15 rounded-2xl p-6 hover:-translate-y-0.5 transition-transform">
              <div className="text-2xl mb-2">&#9888;&#65039;</div>
              <span className="inline-block bg-red-500/15 text-red-400 text-[11px] font-bold px-2.5 py-1 rounded mb-3">
                시중은행
              </span>
              <h4 className="text-base sm:text-lg font-extrabold text-white mb-2">
                잔액 전액 즉시 상환 요구
              </h4>
              <p className="text-white/40 text-xs sm:text-sm leading-relaxed">
                폐업 시 기한이익 상실로 남은 대출금 전액 일시상환 요구. 미상환
                시 신용불량 및 법적 추심 진행
              </p>
            </div>

            {/* 정책자금 */}
            <div className="bg-emerald-500/[0.05] border border-emerald-500/15 rounded-2xl p-6 hover:-translate-y-0.5 transition-transform">
              <div className="text-2xl mb-2">&#10004;&#65039;</div>
              <span className="inline-block bg-emerald-500/15 text-emerald-400 text-[11px] font-bold px-2.5 py-1 rounded mb-3">
                정책자금
              </span>
              <h4 className="text-base sm:text-lg font-extrabold text-white mb-2">
                기존 스케줄대로 분할 상환
              </h4>
              <p className="text-white/40 text-xs sm:text-sm leading-relaxed">
                폐업해도 약정된 상환 조건 유지. 꾸준히 갚으면 문제 없음. 재창업
                시 추가 정책자금 지원 가능
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── CTA ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <a
            href="/contact"
            className="inline-block bg-white text-[#0b50d0] font-extrabold text-base sm:text-lg px-10 py-4 rounded-xl shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all animate-pulse-shadow"
          >
            무료 자금진단 받아보기
          </a>
          <p className="text-white/30 text-xs sm:text-sm mt-3">
            30초면 우리 기업의 정책자금 수혜 가능성을 확인할 수 있습니다
          </p>
        </motion.div>

        {/* 출처 */}
        <p className="text-center text-[10px] sm:text-[11px] text-white/20 mt-10 leading-relaxed">
          금리 출처: 한국은행 기준금리 2.75%(2026.2) · 전국은행연합회 중소기업
          대출금리 · 중진공 정책자금 기준금리
          <br />
          이자 계산: 1억원 / 5년 / 원리금 균등상환 기준 근사치
        </p>
      </div>
    </section>
  );
}
