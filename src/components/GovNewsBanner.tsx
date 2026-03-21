"use client";

import Image from "next/image";
import Link from "next/link";
import { r2 } from "@/lib/r2-images";
import { getAnalysisPosts } from "@/data/posts";

const news = getAnalysisPosts().slice(0, 4);

export default function GovNewsBanner() {
  return (
    <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[14px]">
      {news.map((item) => (
        <Link
          key={item.id}
          href={`/notice/${item.id}`}
          className="group flex flex-col bg-gray-0 border border-gray-10 rounded-lg overflow-hidden no-underline text-inherit transition-all duration-200 hover:border-primary-50 hover:shadow-[0_4px_12px_rgba(11,80,208,0.06)] hover:-translate-y-0.5"
        >
          <div className="w-full aspect-[4/3] overflow-hidden bg-gray-10">
            <Image
              src={r2(item.image)}
              alt={item.title}
              width={400}
              height={300}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="px-[14px] pt-3 pb-[14px]">
            <div className="text-[10px] font-bold text-point-50 mb-1">
              정부지원금 소식
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
            <div className="text-[10px] text-gray-40">
              {item.source} · {item.date}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
