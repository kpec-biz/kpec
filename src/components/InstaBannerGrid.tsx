"use client";

import { useState, useEffect, useRef } from "react";
import { r2 } from "@/lib/r2-images";

const PER_LOAD = 4;
const banners = Array.from({ length: 15 }, (_, i) => ({
  src: `/images/instagram/insta-${String(i + 1).padStart(2, "0")}.png`,
  alt: `KPEC 정책자금 배너 ${i + 1}`,
}));

export default function InstaBannerGrid() {
  const [count, setCount] = useState(PER_LOAD);
  const loaderRef = useRef<HTMLDivElement>(null);
  const done = count >= banners.length;

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
  }, [done, count]); // count 변경마다 observer 재설정

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
            className="text-sm text-primary-60 font-semibold hover:underline"
          >
            Instagram &rarr;
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                  src={r2(b.src)}
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
