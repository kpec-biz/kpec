"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { r2 } from "@/lib/r2-images";

const services = [
  {
    title: "운전자금",
    subtitle: "경영안정자금",
    image: "/images/services/operating-fund.png",
    desc: "인건비·원자재비·판관비 등 기업 운영에 필요한 유동성을 정책금리로 조달하세요. 업종·신용도에 따라 맞춤 자금을 설계합니다.",
    items: [
      "기본금리 연 2.5% (중진공 직접대출 기준)",
      "기업당 최대 5억원 (수출기업 최대 10억원)",
      "거치 2년 포함 최대 5년 상환",
      "DX·ESG 도입 기업 금리우대 적용",
    ],
    href: "/services",
  },
  {
    title: "시설자금",
    subtitle: "설비투자자금",
    image: "/images/services/facility-fund.png",
    desc: "공장 신축·증축, 생산설비·검사장비 도입 등 시설투자 자금을 장기 저금리로 지원합니다. 사업 성장 단계에 맞춰 최적 프로그램을 연결합니다.",
    items: [
      "기업당 최대 60억원 (운전+시설 합산)",
      "최대 10년 분할 상환 (거치 4년 가능)",
      "투융자 결합으로 부채비율 개선 가능",
      "AI 관련 시설투자 추가 금리우대 적용",
    ],
    href: "/services",
  },
  {
    title: "인증 취득",
    subtitle: "벤처·이노비즈·ISO",
    image: "/images/services/certification.png",
    desc: "벤처기업, 이노비즈, ISO 등 주요 인증 취득을 통해 정책자금 우대, 세제 감면, 조달 가점을 확보하세요. 준비부터 심사 대응까지 전담 지원합니다.",
    items: [
      "벤처기업 인증 — 법인세 50% 감면 (5년)",
      "이노비즈 인증 — 보증료 0.2%p 차감·융자 우대",
      "ISO 9001/14001/45001 취득 지원",
      "인증 후 정책자금 연계 전략 제공",
    ],
    href: "/services",
  },
];

function ServiceImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-full h-[180px] bg-gray-10">
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
      )}
      <Image
        src={r2(src)}
        alt={alt}
        fill
        className={`object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        sizes="(max-width: 768px) 100vw, 33vw"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

/* Mobile: Tab badge + detail card */
function MobileServiceCards() {
  const [active, setActive] = useState(0);
  const svc = services[active];

  return (
    <div className="md:hidden">
      {/* Tab badges */}
      <div className="flex gap-2 mb-4">
        {services.map((s, i) => (
          <button
            key={s.title}
            onClick={() => setActive(i)}
            className={`flex-1 py-2.5 px-2 rounded-lg text-[13px] font-semibold transition-all duration-200 ${
              active === i
                ? "bg-primary-60 text-white shadow-sm"
                : "bg-white border border-gray-10 text-gray-60"
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* Active card */}
      <Link
        href={svc.href}
        className="block bg-white border border-gray-10 rounded-xl overflow-hidden transition-all duration-200"
      >
        <div className="relative">
          <ServiceImage src={svc.image} alt={svc.title} />
          <span
            className="absolute bottom-1.5 right-2 text-[9px] px-1.5 py-0.5 rounded"
            style={{
              color: "rgba(255,255,255,0.45)",
              background: "rgba(0,0,0,0.2)",
              backdropFilter: "blur(2px)",
            }}
          >
            AI 생성 이미지
          </span>
        </div>
        <div className="p-4">
          <div className="flex items-baseline gap-2 mb-1.5">
            <h3 className="text-[15px] font-bold text-gray-90">{svc.title}</h3>
            <span className="text-xs text-gray-40">{svc.subtitle}</span>
          </div>
          <p className="text-xs text-gray-50 leading-relaxed mb-3">
            {svc.desc}
          </p>
          <ul className="space-y-1.5">
            {svc.items.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-xs text-gray-50"
              >
                <span className="w-1 h-1 rounded-full bg-primary-50 flex-shrink-0 mt-1.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Link>
    </div>
  );
}

export default function ServiceCards() {
  return (
    <section className="py-14 px-6 bg-gray-5">
      <div className="max-w-[1200px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-9">
          <span className="inline-block bg-primary-5 text-primary-60 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            주요 서비스
          </span>
          <h2 className="text-[20px] sm:text-[26px] font-bold text-gray-90 mb-2 [text-wrap:balance]">
            재무 구조에 맞는 자금을 설계합니다
          </h2>
          <p className="text-[13px] sm:text-sm text-gray-50 [text-wrap:balance]">
            신청 가능 자금을 분석하고 승인 가능성이 높은 최적 경로를 제시합니다
          </p>
        </div>

        {/* Mobile: Tab-based */}
        <MobileServiceCards />

        {/* Desktop: Grid */}
        <div className="hidden md:grid grid-cols-3 gap-5">
          {services.map((svc) => (
            <Link
              key={svc.title}
              href={svc.href}
              className="bg-white border border-gray-10 rounded-xl overflow-hidden hover:border-primary-50 hover:shadow-lg transition-all duration-200 group flex flex-col"
            >
              <div className="relative">
                <ServiceImage src={svc.image} alt={svc.title} />
                <span
                  className="absolute bottom-1.5 right-2 text-[9px] px-1.5 py-0.5 rounded"
                  style={{
                    color: "rgba(255,255,255,0.45)",
                    background: "rgba(0,0,0,0.2)",
                    backdropFilter: "blur(2px)",
                  }}
                >
                  AI 생성 이미지
                </span>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="mb-3">
                  <div className="flex items-baseline gap-2 mb-1">
                    <h3 className="text-base font-bold text-gray-90">
                      {svc.title}
                    </h3>
                    <span className="text-xs text-gray-40">{svc.subtitle}</span>
                  </div>
                  <p className="text-xs text-gray-50 leading-relaxed">
                    {svc.desc}
                  </p>
                </div>
                <ul className="mt-auto space-y-1.5">
                  {svc.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-xs text-gray-50"
                    >
                      <span className="w-1 h-1 rounded-full bg-primary-50 flex-shrink-0 mt-1.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
