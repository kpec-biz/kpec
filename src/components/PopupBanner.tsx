"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PopupNotice {
  id: string;
  title: string;
  summary: string;
  applyPeriod: string;
  source: string;
  pblancId: string;
  originalUrl: string;
}

function parseDeadline(applyPeriod: string): Date | null {
  const match =
    applyPeriod?.match(/(\d{4})[.\-/](\d{2})[.\-/](\d{2})\s*$/) ||
    applyPeriod?.match(/~\s*(\d{4})[.\-/](\d{2})[.\-/](\d{2})/);
  if (!match) return null;
  return new Date(`${match[1]}-${match[2]}-${match[3]}T23:59:59+09:00`);
}

function getDDay(deadline: Date): number {
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/** summary에서 금액 추출: "최대 2억원", "100억원", "5,000만원" 등 */
function extractAmount(summary: string): string | null {
  const match = summary?.match(
    /(?:최대\s*)?(\d[\d,]*(?:\.\d+)?)\s*(억원|만원|조원|억|만)/,
  );
  if (!match) return null;
  return match[0];
}

export default function PopupBanner() {
  const [notice, setNotice] = useState<PopupNotice | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("popup-banner-dismissed");
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const today = new Date();
      if (
        dismissedDate.getFullYear() === today.getFullYear() &&
        dismissedDate.getMonth() === today.getMonth() &&
        dismissedDate.getDate() === today.getDate()
      ) {
        return;
      }
    }

    fetch("/api/notices?popup=true")
      .then((res) => res.json())
      .then((data) => {
        const records = data.records || [];
        if (records.length > 0) {
          const r = records[0];
          const deadline = parseDeadline(r.applyPeriod);
          if (deadline && getDDay(deadline) < 0) return;
          setNotice(r);
          setVisible(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleClose = () => setVisible(false);

  const handleDismissToday = () => {
    localStorage.setItem("popup-banner-dismissed", new Date().toISOString());
    setVisible(false);
  };

  if (!notice) return null;

  const deadline = parseDeadline(notice.applyPeriod);
  const dDay = deadline ? getDDay(deadline) : null;
  const amount = extractAmount(notice.summary);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <div className="absolute inset-0 bg-black/50" />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-[420px] rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 배경 이미지 + 오버레이 */}
            <div className="relative flex flex-col p-6 sm:p-8">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage:
                    'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80")',
                }}
              />
              <div
                className="absolute inset-0"
                style={{ background: "rgba(8, 56, 145, 0.88)" }}
              />

              {/* 상단: 뱃지 */}
              <div className="relative z-10 flex items-center gap-2 mb-5">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-body-xs font-semibold bg-point-50 text-white">
                  특례보증 접수중
                </span>
                {dDay !== null && dDay >= 0 && (
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-body-xs font-bold ${
                      dDay <= 7
                        ? "bg-point-50/30 text-white animate-pulse"
                        : "bg-white/20 text-white"
                    }`}
                  >
                    {dDay === 0 ? "오늘 마감!" : `D-${dDay}`}
                  </span>
                )}
              </div>

              {/* 금액 — 가장 크게 */}
              {amount && (
                <div className="relative z-10 mb-4">
                  <p className="text-body-xs text-white/60 mb-1">지원 금액</p>
                  <p className="text-display-sm sm:text-display-md font-black text-white tracking-tight">
                    {amount}
                  </p>
                </div>
              )}

              {/* 제목 */}
              <div className="relative z-10 mb-5">
                <h2 className="text-heading-sm sm:text-heading-md font-bold text-white leading-tight line-clamp-2">
                  {notice.title}
                </h2>
              </div>

              {/* 핵심 정보: 마감기한 + 기관 — 카드형으로 강조 */}
              <div className="relative z-10 grid grid-cols-2 gap-3 mb-6">
                {/* 마감기한 */}
                <div className="bg-white/15 backdrop-blur-sm rounded-lg px-4 py-3">
                  <p className="text-[11px] text-white/60 mb-0.5">마감기한</p>
                  <p className="text-body-sm font-bold text-white leading-snug">
                    {notice.applyPeriod
                      ? notice.applyPeriod.split("~").pop()?.trim() ||
                        notice.applyPeriod
                      : "상시접수"}
                  </p>
                </div>
                {/* 기관 */}
                <div className="bg-white/15 backdrop-blur-sm rounded-lg px-4 py-3">
                  <p className="text-[11px] text-white/60 mb-0.5">주관기관</p>
                  <p className="text-body-sm font-bold text-white leading-snug truncate">
                    {notice.source || "-"}
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className="relative z-10">
                <a
                  href="/contact"
                  className="block w-full text-center py-3.5 bg-white text-primary-70 font-bold rounded-lg hover:bg-gray-5 transition-colors text-body-md"
                >
                  상담문의 접수하기
                </a>
              </div>
            </div>

            {/* 닫기 버튼 */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
              aria-label="닫기"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* 오늘 하루 보지 않기 */}
            <div className="bg-gray-90 px-6 py-3 flex justify-center">
              <button
                onClick={handleDismissToday}
                className="text-body-xs text-gray-40 hover:text-white transition-colors"
              >
                오늘 하루 보지 않기
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
