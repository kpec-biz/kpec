import Link from "next/link";

const checks = [
  "개인/법인 사업자",
  "업력 제한 없음 (경영안정자금)",
  "창업 7년 미만 (창업자금)",
  "제조·서비스·IT 전 업종",
  "비수도권 기업 우대",
  "DX·ESG·AI 기업 우대",
];

export default function CtaSection() {
  return (
    <section
      className="bg-primary-5 px-8 py-12 text-center"
      style={{ borderTop: "3px solid #0b50d0" }}
    >
      <h2 className="text-[20px] sm:text-[22px] font-bold text-gray-90 mb-1.5 [text-wrap:balance]">
        아래 조건에 해당하면 신청 가능합니다
      </h2>
      <p className="text-[13px] sm:text-sm text-gray-50 mb-6 [text-wrap:balance]">
        중소기업기본법상 중소기업이라면 업종·업력 제한 없이 대부분 신청
        가능합니다 (2026년 예산 소진 시 마감)
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 max-w-[700px] mx-auto mb-6">
        {checks.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 bg-gray-0 border border-gray-10 rounded-md px-3 py-2.5 text-[13px] text-gray-70"
          >
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
                d="M5 13l4 4L19 7"
              />
            </svg>
            {item}
          </div>
        ))}
      </div>

      <div className="flex gap-2.5 justify-center flex-wrap">
        <Link
          href="/contact"
          className="bg-primary-60 text-white px-8 py-3 rounded-md text-sm font-bold no-underline hover:bg-primary-70 transition-colors"
        >
          무료상담 신청하기
        </Link>
        <a
          href="tel:050268004681"
          className="bg-point-50 text-white px-8 py-3 rounded-md text-sm font-bold no-underline hover:bg-point-60 transition-colors"
        >
          전화상담
        </a>
      </div>
    </section>
  );
}
