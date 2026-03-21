"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface NoticeItem {
  pblancId: string;
  title: string;
  source: string;
  publishDate: string;
  category: string;
  summary: string;
  originalUrl: string;
}

export default function GovNewsBanner() {
  const [items, setItems] = useState<NoticeItem[]>([]);

  useEffect(() => {
    fetch("/api/notices?category=분석&limit=4")
      .then((r) => r.json())
      .then((data) => {
        if (data.records) setItems(data.records);
      })
      .catch(() => {});
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[14px]">
      {items.map((item) => {
        const hasThumbnail = item.originalUrl?.includes("r2.dev/thumbnails");

        return (
          <Link
            key={item.pblancId}
            href={`/notice/${item.pblancId}`}
            className="group flex flex-col bg-gray-0 border border-gray-10 rounded-lg overflow-hidden no-underline text-inherit transition-all duration-200 hover:border-primary-50 hover:shadow-[0_4px_12px_rgba(11,80,208,0.06)] hover:-translate-y-0.5"
          >
            {hasThumbnail && (
              <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-10">
                <img
                  src={item.originalUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute bottom-1 right-2 text-[9px] text-white/40">
                  AI 생성 이미지
                </span>
              </div>
            )}
            <div className="px-[14px] pt-3 pb-[14px] flex-1">
              <div className="text-[10px] font-bold text-point-50 mb-1">
                정부정책자금 분석
              </div>
              <div
                className="text-[13px] font-semibold text-gray-90 leading-[1.4] mb-1.5 overflow-hidden"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {item.title}
              </div>
              <p className="text-[11px] text-gray-50 leading-relaxed line-clamp-2 mb-2">
                {item.summary}
              </p>
              <div className="text-[10px] text-gray-40">
                {item.source} · {item.publishDate}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
