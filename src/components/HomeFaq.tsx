import Link from "next/link";
import { homeFaqs } from "@/data/faq";

const relatedLinks: { label: string; href: string; hint: string }[] = [
  {
    label: "중소기업 운전자금 신청 안내",
    href: "/services",
    hint: "연 2.5% 저금리 운영자금 · 최대 10억원",
  },
  {
    label: "시설자금·설비투자 정책자금",
    href: "/services",
    hint: "최대 60억원 · AI 기업 100억원 확대",
  },
  {
    label: "벤처기업·이노비즈·메인비즈 인증",
    href: "/services",
    hint: "기업인증 취득 컨설팅",
  },
  {
    label: "자금적격 진단 (무료)",
    href: "/diagnosis",
    hint: "3단계로 내 기업 맞춤 자금 확인",
  },
  {
    label: "정책자금 지원 8단계 진행절차",
    href: "/process",
    hint: "무료상담 → 서류 → 심사 → 실행",
  },
  {
    label: "업종별 정책자금 성공사례",
    href: "/cases",
    hint: "제조·IT·에너지·식품 승인 실적",
  },
  {
    label: "최신 정책자금 공고·뉴스",
    href: "/notice",
    hint: "매일 09시 업데이트",
  },
  {
    label: "무료 초기상담 신청",
    href: "/contact",
    hint: "전문 컨설턴트 배정",
  },
];

export default function HomeFaq() {
  return (
    <section
      className="py-14"
      aria-labelledby="home-faq-title"
      itemScope
      itemType="https://schema.org/FAQPage"
    >
      <div className="text-center mb-10">
        <span className="inline-block bg-primary-5 text-primary-60 text-xs font-semibold px-3 py-1 rounded-full mb-2">
          자주 묻는 질문
        </span>
        <h2
          id="home-faq-title"
          className="text-2xl sm:text-3xl font-bold text-gray-90"
        >
          정책자금 FAQ
        </h2>
        <p className="text-sm text-gray-60 mt-2">
          중소기업 정책자금에 대해 가장 많이 궁금해하시는 질문들을 모았습니다.
        </p>
      </div>

      <div className="max-w-[820px] mx-auto space-y-4">
        {homeFaqs.map((faq, idx) => (
          <article
            key={idx}
            className="rounded-lg border border-gray-10 bg-white p-5"
            itemScope
            itemProp="mainEntity"
            itemType="https://schema.org/Question"
          >
            <h3
              className="text-base sm:text-lg font-semibold text-gray-90 mb-2"
              itemProp="name"
            >
              Q. {faq.question}
            </h3>
            <div
              itemScope
              itemProp="acceptedAnswer"
              itemType="https://schema.org/Answer"
            >
              <p
                className="text-sm sm:text-[15px] text-gray-70 leading-relaxed"
                itemProp="text"
              >
                {faq.answer}
              </p>
            </div>
          </article>
        ))}
      </div>

      {/* 관련 페이지 — 앵커 텍스트 기반 내부 링크 (SEO) */}
      <nav
        aria-label="관련 페이지"
        className="max-w-[820px] mx-auto mt-10 pt-8 border-t border-gray-10"
      >
        <h3 className="text-sm font-semibold text-gray-60 mb-4 text-center">
          더 자세히 알아보기
        </h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {relatedLinks.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="flex items-center justify-between px-4 py-3 rounded-lg bg-white border border-gray-10 hover:border-primary-40 hover:bg-primary-5 transition-colors group"
              >
                <span className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-80 group-hover:text-primary-60">
                    {item.label}
                  </span>
                  <span className="text-xs text-gray-50 mt-0.5">
                    {item.hint}
                  </span>
                </span>
                <svg
                  className="w-4 h-4 text-gray-30 group-hover:text-primary-60 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
