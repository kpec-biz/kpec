"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { r2 } from "@/lib/r2-images";

interface BizInfoItem {
  pblancNm: string;
  pblancUrl: string;
  jrsdInsttNm: string;
  reqstBeginEndDe: string;
  creatPnttm: string;
  pldirSportRealmLclasCodeNm: string;
  bsnsSumryCn: string;
}

// 하드코딩 뉴스 (정책자금 뉴스 칼럼)
const newsData = [
  {
    image: "/images/headers/services.png",
    category: "정책 분석",
    title: "2026년 정책자금 4.4조원, 달라진 점과 활용 전략",
    date: "2026.01.15",
  },
  {
    image: "/images/headers/process.png",
    category: "자금 가이드",
    title: "AI 기업을 위한 AX 스프린트 우대트랙 완전 정리",
    date: "2026.01.20",
  },
  {
    image: "/images/headers/cases.png",
    category: "인증 안내",
    title: "벤처기업 인증, 정책자금 신청 전에 받아야 하는 이유",
    date: "2026.02.05",
  },
];

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return dateStr.slice(0, 10).replace(/-/g, ".");
}

function getTag(category: string) {
  if (category.includes("기술")) return "기술";
  if (category.includes("인력") || category.includes("고용")) return "인력";
  if (category.includes("경영")) return "경영";
  if (category.includes("금융")) return "금융";
  return "공고";
}

export default function NoticeBoard() {
  const [notices, setNotices] = useState<BizInfoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bizinfo?size=5&page=1")
      .then((res) => res.json())
      .then((data) => {
        if (data.jsonArray) {
          setNotices(data.jsonArray.slice(0, 5));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-14 bg-gray-5">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-10">
          <span className="inline-block bg-primary-5 text-primary-60 text-xs font-semibold px-3 py-1 rounded-full mb-2">
            알림·자료
          </span>
          <h2 className="text-heading-md font-bold text-gray-90">
            정책자금 공고와 뉴스
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* 왼쪽: 정책자금 공고 (기업마당 API 연동) */}
          <div className="bg-white border border-gray-10 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b-2 border-primary-60">
              <h3 className="text-sm font-bold text-gray-90 flex items-center gap-1.5">
                <svg
                  className="w-4 h-4 text-primary-60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                정책자금 공고
              </h3>
              <Link
                href="/notice"
                className="text-xs text-primary-60 font-medium"
              >
                더보기 ›
              </Link>
            </div>

            {loading ? (
              <div className="p-8 text-center text-sm text-gray-40">
                불러오는 중...
              </div>
            ) : notices.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-40">
                공고를 불러오지 못했습니다
              </div>
            ) : (
              notices.map((item, i) => (
                <a
                  key={i}
                  href={item.pblancUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-5 py-3 border-b border-gray-10 last:border-b-0 hover:bg-gray-5 transition-colors text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded ${i === 0 ? "bg-red-50 text-point-50" : "bg-primary-5 text-primary-60"}`}
                    >
                      {i === 0
                        ? "신규"
                        : getTag(item.pldirSportRealmLclasCodeNm)}
                    </span>
                    <span className="text-gray-80 font-medium truncate">
                      {item.pblancNm}
                    </span>
                  </div>
                  <span className="text-xs text-gray-40 flex-shrink-0 ml-3">
                    {formatDate(item.creatPnttm)}
                  </span>
                </a>
              ))
            )}
          </div>

          {/* 오른쪽: 정책자금 뉴스 (썸네일형) */}
          <div className="bg-white border border-gray-10 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b-2 border-primary-60">
              <h3 className="text-sm font-bold text-gray-90 flex items-center gap-1.5">
                <svg
                  className="w-4 h-4 text-primary-60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
                정책자금 뉴스
              </h3>
              <Link
                href="/notice"
                className="text-xs text-primary-60 font-medium"
              >
                더보기 ›
              </Link>
            </div>
            <div className="p-3">
              {newsData.map((news, i) => (
                <Link
                  key={i}
                  href="/notice"
                  className="flex gap-3 p-2 rounded-lg hover:bg-gray-5 transition-colors"
                >
                  <div className="w-[100px] h-[68px] rounded-md overflow-hidden flex-shrink-0 bg-gray-10 relative">
                    <Image
                      src={r2(news.image)}
                      alt={news.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <span className="text-[10px] font-semibold text-primary-60 mb-0.5">
                      {news.category}
                    </span>
                    <span className="text-[13px] font-medium text-gray-90 line-clamp-2 leading-snug">
                      {news.title}
                    </span>
                    <span className="text-[11px] text-gray-40 mt-1">
                      {news.date}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
