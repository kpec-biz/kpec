"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import { getNewsPosts, getAnalysisPosts } from "@/data/posts";

// 기업마당 API 공고 타입
interface BizInfoItem {
  pblancNm: string;
  pblancUrl: string;
  creatPnttm: string;
  pldirSportRealmLclasCodeNm: string;
  bsnsSumryCn: string;
}

const newsData = getNewsPosts();
const analysisData = getAnalysisPosts();

const faqs = [
  {
    q: "정책자금은 누가 신청할 수 있나요?",
    a: "중소기업기본법 제2조에 따른 중소기업이면 신청 가능합니다. 다만, 상장사, 자본금 200억원 초과 기업, 세금 체납 기업, 휴·폐업 기업 등은 제외됩니다.",
  },
  {
    q: "신청에서 자금 실행까지 얼마나 걸리나요?",
    a: "일반적으로 신청 후 2~4주 내 심사 결과가 통보되며, 승인 후 약정·실행까지 3~5 영업일이 소요됩니다.",
  },
  {
    q: "정책자금 컨설팅 비용은 얼마인가요?",
    a: "KPEC는 후불 성공보수제로 운영됩니다. 자금 승인 전까지 어떠한 비용도 청구하지 않으며, 자금 실행 이후에만 성공 보수가 발생합니다.",
  },
  {
    q: "운전자금과 시설자금을 동시에 신청할 수 있나요?",
    a: "가능합니다. 다만 기업당 운전+시설자금 합산 융자한도는 60억원 이내입니다. AI 기업(AX 스프린트) 선정 시 100억원까지 확대됩니다.",
  },
  {
    q: "비수도권 기업은 추가 혜택이 있나요?",
    a: "네, 비수도권 사업자는 정책자금 금리에서 0.2%p가 추가 차감됩니다. 비수도권 집중 투입 비율이 60% 이상으로 배정 우선순위에서 유리합니다.",
  },
];

const tabs = ["정책자금 공고", "정책자금 뉴스", "정책자금 분석", "FAQ"];

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return dateStr.slice(0, 10).replace(/-/g, ".");
}

function getTag(category: string) {
  if (category.includes("기술")) return "기술";
  if (category.includes("인력")) return "인력";
  if (category.includes("경영")) return "경영";
  if (category.includes("금융")) return "금융";
  return "공고";
}

const tabMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 } as const,
  transition: { duration: 0.25, ease: [0, 0, 0.2, 1] as const },
};

export default function NoticePage() {
  const [activeTab, setActiveTab] = useState(0);
  const [bizInfoItems, setBizInfoItems] = useState<BizInfoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bizinfo?size=10&page=1")
      .then((res) => res.json())
      .then((data) => {
        if (data.jsonArray) setBizInfoItems(data.jsonArray);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader
        bgImage="/images/headers/notice.png"
        title="알림·자료"
        subtitle="정책자금 공고, 뉴스, 분석 리포트를 확인하세요"
      />

      <section className="py-12 bg-gray-5 min-h-[60vh]">
        <div className="max-w-[1200px] mx-auto px-6">
          {/* 탭 */}
          <div className="flex gap-1 mb-8 border-b-2 border-gray-10">
            {tabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`px-5 py-3 text-sm font-semibold transition-colors relative ${
                  activeTab === i
                    ? "text-primary-60"
                    : "text-gray-50 hover:text-gray-80"
                }`}
              >
                {tab}
                {activeTab === i && (
                  <motion.span
                    layoutId="tab-indicator"
                    className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-primary-60"
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* 탭 1: 정책자금 공고 (기업마당 API → 내부 링크) */}
            {activeTab === 0 && (
              <motion.div
                key="tab-0"
                {...tabMotion}
                className="bg-white rounded-xl border border-gray-10"
              >
                {loading ? (
                  <div className="p-12 text-center text-gray-40">
                    불러오는 중...
                  </div>
                ) : bizInfoItems.length === 0 ? (
                  <div className="p-12 text-center text-gray-40">
                    공고를 불러오지 못했습니다
                  </div>
                ) : (
                  <div className="divide-y divide-gray-10">
                    {bizInfoItems.map((item, i) => (
                      <BizInfoRow key={i} item={item} index={i} />
                    ))}
                  </div>
                )}
                <div className="px-5 py-3 border-t border-gray-10 text-right">
                  <span className="text-xs text-gray-40">
                    출처: 기업마당(bizinfo.go.kr) · 매일 09시 업데이트
                  </span>
                </div>
              </motion.div>
            )}

            {/* 탭 2: 정책자금 뉴스 */}
            {activeTab === 1 && (
              <motion.div
                key="tab-1"
                {...tabMotion}
                className="bg-white rounded-xl border border-gray-10"
              >
                <div className="divide-y divide-gray-10">
                  {newsData.map((item) => (
                    <Link
                      key={item.id}
                      href={`/notice/${item.id}`}
                      className="flex items-center gap-4 py-4 px-5 hover:bg-gray-5 transition-colors"
                    >
                      <span className="flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-success/10 text-success">
                        {item.tag}
                      </span>
                      <span className="flex-1 text-gray-80 font-medium truncate">
                        {item.title}
                      </span>
                      <span className="flex-shrink-0 text-sm text-gray-40">
                        {item.date}
                      </span>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 탭 3: 정책자금 분석 */}
            {activeTab === 2 && (
              <motion.div
                key="tab-2"
                {...tabMotion}
                className="bg-white rounded-xl border border-gray-10"
              >
                <div className="divide-y divide-gray-10">
                  {analysisData.map((item) => (
                    <Link
                      key={item.id}
                      href={`/notice/${item.id}`}
                      className="flex items-center gap-4 py-4 px-5 hover:bg-gray-5 transition-colors"
                    >
                      <span className="flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-point-50/10 text-point-50">
                        {item.tag}
                      </span>
                      <span className="flex-1 text-gray-80 font-medium truncate">
                        {item.title}
                      </span>
                      <span className="flex-shrink-0 text-sm text-gray-40">
                        {item.date}
                      </span>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 탭 4: FAQ */}
            {activeTab === 3 && (
              <motion.div key="tab-3" {...tabMotion} className="space-y-3">
                {faqs.map((item, i) => (
                  <FaqItem key={i} q={item.q} a={item.a} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}

// 기업마당 공고 행 — 클릭 시 내부에서 요약 펼침 (외부 링크 X)
function BizInfoRow({ item, index }: { item: BizInfoItem; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 py-4 px-5 hover:bg-gray-5 transition-colors text-left"
      >
        <span
          className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${index === 0 ? "bg-red-50 text-point-50" : "bg-primary-5 text-primary-60"}`}
        >
          {index === 0 ? "신규" : getTag(item.pldirSportRealmLclasCodeNm)}
        </span>
        <span className="flex-1 text-gray-80 font-medium truncate">
          {item.pblancNm}
        </span>
        <span className="flex-shrink-0 text-sm text-gray-40">
          {formatDate(item.creatPnttm)}
        </span>
        <svg
          className={`w-4 h-4 text-gray-40 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 pt-1">
              <p className="text-sm text-gray-60 leading-relaxed mb-3">
                {item.bsnsSumryCn || item.pblancNm}
              </p>
              <div className="flex gap-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-60 text-white text-xs font-semibold rounded-lg hover:bg-primary-70 transition-colors"
                >
                  이 공고로 상담신청
                </Link>
                <Link
                  href="/diagnosis"
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-20 text-gray-60 text-xs font-semibold rounded-lg hover:border-primary-40 hover:text-primary-60 transition-colors"
                >
                  자금적격 진단
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-10 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left bg-white hover:bg-gray-5 transition-colors"
      >
        <span className="font-semibold text-gray-90">{q}</span>
        <svg
          className={`w-5 h-5 text-gray-50 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 py-4 bg-gray-5 text-gray-70 leading-relaxed border-t border-gray-10">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
