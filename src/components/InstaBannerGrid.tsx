"use client";

import { useState, useEffect, useRef } from "react";
import bannerPool from "../../worker/src/banner-pool.json";

const PER_LOAD = 8;

const UNSPLASH_PHOTOS = [
  "photo-1486406146926-c627a92ad1ab",
  "photo-1497366216548-37526070297c",
  "photo-1554224155-6726b3ff858f",
  "photo-1560472354-b33ff0c44a43",
  "photo-1507003211169-0a1dd7228f2d",
  "photo-1573164713714-d95e436ab8d6",
  "photo-1551836022-d5d88e9218df",
  "photo-1504384308090-c894fdcc538d",
];

const ACCENT_COLORS = [
  "#ED2939",
  "#4ADE80",
  "#FACC15",
  "#60A5FA",
  "#ED2939",
  "#4ADE80",
];

interface BannerItem {
  title1: string;
  accent: string;
  title2: string;
  sub: string;
  badge: string;
  accentColor: string;
  photoUrl: string;
}

// 텍스트풀에서 배너 아이템 생성
const allBanners: BannerItem[] = bannerPool.map((item, idx) => ({
  ...item,
  badge: `REASON ${String((idx % 12) + 1).padStart(2, "0")}`,
  accentColor: ACCENT_COLORS[idx % ACCENT_COLORS.length],
  photoUrl: `https://images.unsplash.com/${UNSPLASH_PHOTOS[idx % UNSPLASH_PHOTOS.length]}?w=600&q=70`,
}));

function BannerCard({ item }: { item: BannerItem }) {
  const subLines = item.sub.split("\\n");
  return (
    <div className="group block rounded-lg overflow-hidden border border-gray-10 hover:border-primary-40 transition-all cursor-pointer">
      <div
        className="aspect-[3/4] relative overflow-hidden bg-black"
        style={{ containerType: "inline-size" }}
      >
        <img
          src={item.photoUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-[rgba(10,15,30,0.82)]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-[7%] z-[1]">
          <span
            className="px-[3%] py-[1%] rounded text-white font-bold tracking-wider"
            style={{
              backgroundColor: item.accentColor,
              fontSize: "clamp(8px, 2.2cqi, 30px)",
            }}
          >
            {item.badge}
          </span>
          <div className="w-[5%] h-[0.3%] bg-[#ED2939] rounded mt-[2.5%]" />
          <div
            className="mt-[3%] text-center text-white font-black leading-[1.3] tracking-tight break-keep"
            style={{ fontSize: "clamp(18px, 7.6cqi, 82px)" }}
          >
            {item.title1}
            {item.accent && (
              <>
                <br />
                <span style={{ color: item.accentColor }}>{item.accent}</span>
              </>
            )}
            {item.title2}
          </div>
          <div
            className="mt-[3%] text-center text-white/75 leading-relaxed"
            style={{ fontSize: "clamp(10px, 3.1cqi, 34px)" }}
          >
            {subLines.map((line, i) => (
              <span key={i}>
                {line}
                {i < subLines.length - 1 && <br />}
              </span>
            ))}
          </div>
        </div>
        <div className="absolute bottom-[5.5%] left-0 right-0 text-center z-[1]">
          <span
            className="font-black tracking-wider"
            style={{ fontSize: "clamp(14px, 3.8cqi, 52px)" }}
          >
            <span className="text-[#ED2939]">K</span>
            <span className="text-white">PEC</span>
          </span>
          <span
            className="font-bold text-white ml-[1%] tracking-wide"
            style={{ fontSize: "clamp(11px, 3.1cqi, 42px)" }}
          >
            기업정책자금센터
          </span>
        </div>
      </div>
    </div>
  );
}

export default function InstaBannerGrid() {
  const [count, setCount] = useState(PER_LOAD);
  const loaderRef = useRef<HTMLDivElement>(null);
  const done = count >= allBanners.length;

  useEffect(() => {
    if (done) return;
    const el = loaderRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCount((c) => Math.min(c + PER_LOAD, allBanners.length));
        }
      },
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [done, count]);

  return (
    <section className="py-12 bg-white">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-90">
              KPEC 정책자금 콘텐츠
            </h3>
            <p className="text-sm text-gray-50 mt-1">
              정부 정책자금의 핵심을 한눈에
            </p>
          </div>
          <a
            href="https://www.instagram.com/kpec77/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-primary-60 font-semibold hover:underline"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
            @KPEC77
          </a>
        </div>

        {/* Mobile: 4개만 2x2 */}
        <div className="grid grid-cols-2 gap-3 md:hidden">
          {allBanners.slice(0, 4).map((b, i) => (
            <BannerCard key={i} item={b} />
          ))}
        </div>
        {/* Desktop: infinite scroll */}
        <div className="hidden md:grid grid-cols-4 gap-3">
          {allBanners.slice(0, count).map((b, i) => (
            <BannerCard key={i} item={b} />
          ))}
        </div>

        {!done && (
          <div ref={loaderRef} className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-gray-20 border-t-primary-50 rounded-full animate-spin" />
          </div>
        )}
      </div>
    </section>
  );
}
