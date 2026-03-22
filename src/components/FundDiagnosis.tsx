import Link from "next/link";

const steps = [
  { num: "1", label: "업종 확인" },
  { num: "2", label: "경영 현황" },
  { num: "3", label: "자금 용도" },
];

export default function FundDiagnosis() {
  return (
    <section
      className="relative z-0 pt-24 pb-12 px-6 text-center -mt-12"
      style={{
        background: "linear-gradient(135deg, #083891, #0b50d0)",
      }}
    >
      <div className="max-w-[800px] mx-auto">
        <h2 className="text-[20px] sm:text-[26px] font-bold text-white mb-2 [text-wrap:balance]">
          귀사에 적합한 정책자금, 지금 확인하세요
        </h2>
        <p className="text-[13px] sm:text-sm text-white/60 mb-7 [text-wrap:balance]">
          업종·규모·자금용도에 따라 신청 가능한 정책자금이 달라집니다
        </p>

        {/* Steps */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-5 mb-8">
          {steps.map((step, i) => (
            <div key={step.num} className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-xs font-bold text-white">
                  {step.num}
                </span>
                {step.label}
              </div>
              {i < steps.length - 1 && (
                <svg
                  className="hidden sm:block"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(255,255,255,0.35)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              )}
            </div>
          ))}
        </div>

        <Link
          href="/diagnosis"
          className="inline-flex items-center gap-2 bg-white text-primary-60 font-semibold text-sm px-7 py-3 rounded-lg hover:bg-primary-5 transition-colors"
        >
          자금적격 진단 시작
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
