"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

function CountUp({
  end,
  suffix = "",
  duration = 2,
}: {
  end: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

const stats = [
  {
    value: 44313,
    prefix: "",
    suffix: "억",
    display: null,
    label: "정책자금 총 규모",
    mobileLabel: "총 규모",
    sub: "4조 4,313억",
    mobileSub: "4.4조",
  },
  {
    value: null,
    prefix: "연 ",
    suffix: "",
    display: "연 2.5%~",
    label: "정책자금 기본 금리",
    mobileLabel: "기본 금리",
    sub: null,
    mobileSub: null,
  },
  {
    value: 60,
    prefix: "",
    suffix: "억원",
    display: null,
    label: "기업당 최대 융자한도",
    mobileLabel: "최대 융자한도",
    sub: null,
    mobileSub: null,
  },
  {
    value: 508,
    prefix: "",
    suffix: "개",
    display: null,
    label: "지원사업 수",
    mobileLabel: "지원사업 수",
    sub: null,
    mobileSub: null,
  },
];

export default function Stats() {
  return (
    <section className="bg-primary-70 py-8 sm:py-10">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 text-center">
          {stats.map((stat, i) => (
            <div key={i}>
              {/* Desktop */}
              <div className="hidden sm:block text-4xl font-bold text-white mb-1">
                {stat.display ? (
                  <span>{stat.display}</span>
                ) : stat.sub ? (
                  <span>{stat.sub}</span>
                ) : (
                  <span>
                    {stat.prefix}
                    <CountUp end={stat.value!} suffix={stat.suffix} />
                  </span>
                )}
              </div>
              {/* Mobile */}
              <div className="sm:hidden text-[22px] font-bold text-white mb-0.5 whitespace-nowrap">
                {stat.display ? (
                  <span>{stat.display}</span>
                ) : stat.mobileSub ? (
                  <span>{stat.mobileSub}</span>
                ) : stat.sub ? (
                  <span>{stat.sub}</span>
                ) : (
                  <span>
                    {stat.prefix}
                    <CountUp end={stat.value!} suffix={stat.suffix} />
                  </span>
                )}
              </div>
              <div
                className="text-[10px] sm:text-sm whitespace-nowrap"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                <span className="sm:hidden">{stat.mobileLabel}</span>
                <span className="hidden sm:inline">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
