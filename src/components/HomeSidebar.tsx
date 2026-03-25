"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { r2 } from "@/lib/r2-images";

const miniStats = [
  { value: "4.4조", label: "총 예산" },
  { value: "2.5%~", label: "기본 금리" },
  { value: "60억", label: "최대 한도" },
  { value: "508개", label: "지원사업" },
];

const quickLinks = [
  {
    href: "/diagnosis",
    label: "자금 적격 진단",
    icon: (
      <svg
        className="w-3.5 h-3.5 text-primary-60 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
    ),
  },
  {
    href: "/funds/operating",
    label: "운전자금",
    icon: (
      <svg
        className="w-3.5 h-3.5 text-primary-60 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" d="M12 7v4l3 2" />
      </svg>
    ),
  },
  {
    href: "/funds/facility",
    label: "시설자금",
    icon: (
      <svg
        className="w-3.5 h-3.5 text-primary-60 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 21h18M5 21V7l7-4 7 4v14"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 21v-6h6v6" />
      </svg>
    ),
  },
  {
    href: "/certification",
    label: "인증 컨설팅",
    icon: (
      <svg
        className="w-3.5 h-3.5 text-primary-60 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <rect x="4" y="4" width="16" height="16" rx="3" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12l3 3 5-5"
        />
      </svg>
    ),
  },
  {
    href: "tel:01084176800",
    label: "전화상담",
    icon: (
      <svg
        className="w-3.5 h-3.5 text-primary-60 shrink-0"
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
    ),
  },
];

export default function HomeSidebar() {
  return (
    <aside className="border-l border-gray-10 pl-4 pr-2 py-6">
      {/* 영상 */}
      <div className="mb-5">
        <div className="text-[12px] font-bold text-gray-40 uppercase tracking-wide pb-1.5 border-b border-gray-10 mb-2.5">
          정책자금 안내 영상
        </div>
        <div className="rounded-md overflow-hidden border border-gray-10 bg-gray-0">
          <video autoPlay muted loop playsInline className="w-full block">
            <source src="/videos/policy-compare.mp4" type="video/mp4" />
          </video>
          <div className="px-3 py-2.5">
            <div className="text-[13px] font-bold text-gray-90 mb-0.5">
              정책자금 비교 안내
            </div>
            <div className="text-[11px] text-gray-40">
              운전자금·시설자금 조건 비교
            </div>
          </div>
        </div>
      </div>

      {/* 상담 CTA */}
      <div className="mb-5">
        <div className="bg-primary-60 rounded-md px-4 py-[18px] text-center text-white">
          <h4 className="text-[14px] font-bold mb-1">무료 상담 신청</h4>
          <p
            className="text-[11px] mb-2.5"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            승인 전 비용 0원, 성공보수 후불제
          </p>
          <Link
            href="/contact"
            className="inline-block bg-white text-primary-60 px-5 py-2 rounded-md text-xs font-bold no-underline hover:bg-primary-5 transition-colors"
          >
            신청하기
          </Link>
        </div>
      </div>

      {/* 2026 미니 통계 */}
      <div className="mb-5">
        <div className="text-[12px] font-bold text-gray-40 uppercase tracking-wide pb-1.5 border-b border-gray-10 mb-2">
          2026 정책자금 현황
        </div>
        <div className="grid grid-cols-2 gap-2">
          {miniStats.map((stat, i) => (
            <div
              key={i}
              className="bg-gray-0 border border-gray-10 rounded-md p-2.5 text-center"
            >
              <div className="text-base font-bold text-primary-60">
                {stat.value}
              </div>
              <div className="text-[9px] text-gray-40">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 바로가기 */}
      <div>
        <div className="text-[12px] font-bold text-gray-40 uppercase tracking-wide pb-1.5 border-b border-gray-10 mb-1">
          바로가기
        </div>
        <div>
          {quickLinks.map((link, i) => (
            <Link
              key={i}
              href={link.href}
              className="flex items-center gap-1.5 text-[13px] text-gray-70 no-underline py-2 border-b border-gray-10 last:border-b-0 hover:text-primary-60 transition-colors"
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      {/* 인스타그램 피드 */}
      <div>
        <h4 className="text-xs font-bold text-gray-40 uppercase tracking-wider mb-3 border-b border-gray-10 pb-2">
          Instagram
        </h4>
        <InstagramFeed />
      </div>
    </aside>
  );
}

const instaPosts = [
  {
    image: "/images/instagram/insta-01.png",
    caption: "은행 금리의 절반으로 자금을 조달하세요",
    likes: 47,
  },
  {
    image: "/images/instagram/insta-02.png",
    caption: "최대 2년 거치, 부담 없는 상환 구조",
    likes: 63,
  },
  {
    image: "/images/instagram/insta-03.png",
    caption: "정책자금으로 기업 성장의 발판을 마련하세요",
    likes: 85,
  },
  {
    image: "/images/instagram/insta-04.png",
    caption: "기업 신용등급 UP의 지름길",
    likes: 52,
  },
  {
    image: "/images/instagram/insta-05.png",
    caption: "연간 20조 규모, 정부가 쏩니다",
    likes: 71,
  },
  {
    image: "/images/instagram/insta-06.png",
    caption: "무료 자격진단, 지금 바로 확인하세요",
    likes: 94,
  },
  {
    image: "/images/instagram/insta-07.png",
    caption: "담보 없이도 가능한 정책자금",
    likes: 58,
  },
  {
    image: "/images/instagram/insta-08.png",
    caption: "창업 3년 이내라면 더 유리합니다",
    likes: 66,
  },
  {
    image: "/images/instagram/insta-09.png",
    caption: "경쟁사는 이미 받고 있습니다",
    likes: 73,
  },
  {
    image: "/images/instagram/insta-10.png",
    caption: "세금 절감 효과까지, 일석이조",
    likes: 41,
  },
  {
    image: "/images/instagram/insta-11.png",
    caption: "운전·시설·R&D 다양한 자금 유형",
    likes: 55,
  },
  {
    image: "/images/instagram/insta-12.png",
    caption: "하반기 마감 전, 지금이 신청 적기!",
    likes: 88,
  },
  {
    image: "/images/instagram/insta-13.png",
    caption: "수출기업이라면 금리 추가 우대!",
    likes: 47,
  },
  {
    image: "/images/instagram/insta-14.png",
    caption: "복잡한 서류, 전문가가 준비를 도와드립니다",
    likes: 63,
  },
  {
    image: "/images/instagram/insta-15.png",
    caption: "2026년 신규 정책자금, 지금 확인하세요",
    likes: 85,
  },
].map((p) => ({ ...p, link: "https://www.instagram.com/kpec77/" }));

function InstagramFeed() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % instaPosts.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const post = instaPosts[current];

  return (
    <a
      href={post.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg border border-gray-10 overflow-hidden bg-white hover:border-primary-40 transition-colors"
    >
      {/* 인스타 헤더 */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-10">
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
            <span className="text-[7px] font-black text-point-50">K</span>
            <span className="text-[7px] font-light text-primary-60">P</span>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-gray-80">kpec77</span>
        <svg
          className="w-3 h-3 text-primary-50 ml-auto"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      </div>
      {/* 이미지 3:4 */}
      <div className="aspect-[3/4] relative overflow-hidden">
        <img
          src={r2(post.image)}
          alt={post.caption}
          className="w-full h-full object-cover transition-opacity duration-500"
        />
      </div>
      {/* 하단 */}
      <div className="px-3 py-2">
        <div className="flex items-center gap-3 mb-1.5">
          <svg
            className="w-4 h-4 text-point-50"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span className="text-[11px] font-semibold text-gray-80">
            {post.likes}
          </span>
        </div>
        <p className="text-[11px] text-gray-70 leading-relaxed line-clamp-2">
          <span className="font-semibold text-gray-90">kpec77</span>{" "}
          {post.caption}
        </p>
      </div>
      {/* 카운터 */}
      <div className="flex justify-center pb-2">
        <span className="text-[10px] text-gray-40">
          {current + 1} / {instaPosts.length}
        </span>
      </div>
    </a>
  );
}
