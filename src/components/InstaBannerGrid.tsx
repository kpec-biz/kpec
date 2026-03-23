"use client";

import { useState, useEffect, useRef } from "react";
import { r2 } from "@/lib/r2-images";

const PER_LOAD = 4;

// 정적 fallback 배너 (파이프라인 데이터 로드 실패 시)
const staticBanners = Array.from({ length: 15 }, (_, i) => ({
  src: `/images/instagram/insta-${String(i + 1).padStart(2, "0")}.png`,
  alt: `KPEC 정책자금 배너 ${i + 1}`,
}));

interface BannerItem {
  src: string;
  alt: string;
}

export default function InstaBannerGrid() {
  const [banners, setBanners] = useState<BannerItem[]>(staticBanners);
  const [count, setCount] = useState(PER_LOAD);
  const loaderRef = useRef<HTMLDivElement>(null);
  const done = count >= banners.length;

  // Airtable에서 인스타 배너 동적 로드
  useEffect(() => {
    fetch(`/api/notices?category=${encodeURIComponent("인스타")}&limit=30`)
      .then((r) => r.json())
      .then((data) => {
        if (data.records?.length > 0) {
          const dynamic: BannerItem[] = data.records
            .filter(
              (r: Record<string, string>) => r.originalUrl || r.contentUrl,
            )
            .map((r: Record<string, string>) => ({
              src: r.originalUrl || r.contentUrl,
              alt: r.title || "KPEC 정책자금 배너",
            }));
          if (dynamic.length > 0) {
            // 동적 배너(최신) + 정적 배너(기존)
            const combined = [...dynamic, ...staticBanners];
            setBanners(combined);
          }
        }
      })
      .catch(() => {
        // 실패 시 정적 배너 유지
      });
  }, []);

  useEffect(() => {
    if (done) return;
    const el = loaderRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCount((c) => Math.min(c + PER_LOAD, banners.length));
        }
      },
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [done, count, banners.length]);

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
          {banners.slice(0, 4).map((b, i) => (
            <a
              key={i}
              href="https://www.instagram.com/kpec77/"
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-lg overflow-hidden border border-gray-10 hover:border-primary-40 transition-all"
            >
              <div className="aspect-[3/4] relative overflow-hidden bg-gray-5">
                <img
                  src={b.src.startsWith("http") ? b.src : r2(b.src)}
                  alt={b.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            </a>
          ))}
        </div>
        {/* Desktop: infinite scroll */}
        <div className="hidden md:grid grid-cols-4 gap-3">
          {banners.slice(0, count).map((b, i) => (
            <a
              key={i}
              href="https://www.instagram.com/kpec77/"
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-lg overflow-hidden border border-gray-10 hover:border-primary-40 transition-all"
            >
              <div className="aspect-[3/4] relative overflow-hidden bg-gray-5">
                <img
                  src={b.src.startsWith("http") ? b.src : r2(b.src)}
                  alt={b.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            </a>
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
