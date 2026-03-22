import PageHeader from "@/components/PageHeader";
import ScrollReveal from "@/components/ScrollReveal";
import Link from "next/link";

const steps = [
  {
    num: "01",
    title: "무료 초기 상담",
    desc: "전화·온라인 상담으로 기업 현황을 파악하고 활용 가능한 정책자금 범위를 안내합니다.",
    detail: "소요시간: 30분 내외",
  },
  {
    num: "02",
    title: "현황 분석",
    desc: "재무제표, 사업자등록증 등 기초 서류를 바탕으로 기업의 자격 요건과 최적 자금을 분석합니다.",
    detail: "소요시간: 1~2 영업일",
  },
  {
    num: "03",
    title: "맞춤 자금 설계",
    desc: "기업 상황에 맞는 정책자금 종류, 금액, 금리, 상환 조건을 구체적으로 설계합니다.",
    detail: "소요시간: 1~2 영업일",
  },
  {
    num: "04",
    title: "서류 준비 지원",
    desc: "사업계획서, 재무제표, 각종 확인서 등 신청에 필요한 서류 준비를 전문가가 함께 지원합니다.",
    detail: "소요시간: 3~5 영업일",
  },
  {
    num: "05",
    title: "신청 접수",
    desc: "중진공·소진공 누리집 또는 대리인 신청을 통해 정책자금 신청서를 접수합니다.",
    detail: "소요시간: 당일",
  },
  {
    num: "06",
    title: "심사 대응",
    desc: "기관의 서류 보완 요청, 현장 방문 심사 등에 신속하게 대응하여 심사 통과율을 높입니다.",
    detail: "소요시간: 2~4주",
  },
  {
    num: "07",
    title: "승인 및 실행",
    desc: "심사 통과 후 대출 약정, 자금 실행까지 전 과정을 함께합니다.",
    detail: "소요시간: 3~5 영업일",
  },
  {
    num: "08",
    title: "사후 관리",
    desc: "자금 실행 이후에도 금리 변동, 추가 자금 기회, 인증 갱신 등을 지속 모니터링합니다.",
    detail: "지속적 관리",
  },
];

const checklist = [
  "중소기업기본법상 중소기업에 해당하는가?",
  "사업자등록증 보유 및 정상 영업 중인가?",
  "세금 체납 이력이 없는가?",
  "최근 3년 이자보상배율이 1.0 이상인가?",
  "휴·폐업 상태가 아닌가?",
  "도박·사행·향락업 등 제외 업종이 아닌가?",
  "정부 정책자금 누적 200억원을 초과하지 않는가?",
  "시설자금의 경우 시설투자 계획이 구체적인가?",
];

export default function ProcessPage() {
  return (
    <>
      <PageHeader
        bgImage="/images/headers/process.png"
        title="진행절차"
        subtitle="상담부터 사후관리까지 전 과정을 책임집니다"
      />

      {/* 타임라인 */}
      <ScrollReveal>
        <section className="py-16 bg-white">
          <div className="max-w-[800px] mx-auto px-6">
            <h2 className="text-2xl font-bold text-gray-90 mb-12 text-center">
              8단계 정책자금 지원 프로세스
            </h2>
            <div className="relative">
              {/* 세로 라인 */}
              <div className="absolute left-[27px] sm:left-[39px] top-4 bottom-4 w-0.5 bg-primary-20" />
              <div className="space-y-5 sm:space-y-8">
                {steps.map((step, i) => (
                  <div key={step.num} className="flex gap-3 sm:gap-6">
                    {/* 원형 넘버 */}
                    <div className="relative flex-shrink-0">
                      <div
                        className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full flex items-center justify-center font-bold text-sm sm:text-lg border-2 ${
                          i < 4
                            ? "bg-primary-60 border-primary-60 text-white"
                            : "bg-white border-primary-40 text-primary-60"
                        }`}
                      >
                        {step.num}
                      </div>
                    </div>
                    {/* 카드 */}
                    <div className="flex-1 bg-gray-5 rounded-xl p-4 sm:p-5 border border-gray-10">
                      <h3 className="text-[14px] sm:text-base font-bold text-gray-90 mb-1 sm:mb-2">
                        {step.title}
                      </h3>
                      <p className="text-[12px] sm:text-sm text-gray-60 leading-relaxed mb-2 sm:mb-3">
                        {step.desc}
                      </p>
                      <span className="inline-block bg-primary-5 text-primary-60 text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full">
                        {step.detail}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>
      {/* 후불 성공보수제 배너 */}
      <ScrollReveal>
        <section className="py-12 bg-primary-80">
          <div className="max-w-[800px] mx-auto px-6 text-center">
            <span className="inline-block bg-point-50 text-white text-sm font-bold px-4 py-1.5 rounded-full mb-4">
              KPEC 차별점
            </span>
            <h2 className="text-xl sm:text-3xl font-bold text-white mb-4 [text-wrap:balance]">
              후불 성공보수제 운영
            </h2>
            <p className="text-[13px] sm:text-base text-white/70 leading-relaxed max-w-xl mx-auto [text-wrap:balance]">
              정책자금 신청 결과가 나오기 전에는 어떠한 비용도 청구하지
              않습니다.{" "}
              <strong className="text-white">
                자금 승인 이후에만 수수료가 발생
              </strong>
              하므로 안심하고 의뢰하실 수 있습니다.
            </p>
          </div>
        </section>
      </ScrollReveal>
      {/* 자격요건 체크리스트 */}
      <ScrollReveal>
        <section className="py-16 bg-gray-5">
          <div className="max-w-[800px] mx-auto px-6">
            <h2 className="text-2xl font-bold text-gray-90 mb-8 text-center">
              신청 자격 체크리스트
            </h2>
            <div className="bg-white rounded-xl border border-gray-10 p-6">
              <ul className="space-y-3">
                {checklist.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-primary-40 flex items-center justify-center mt-0.5">
                      <svg
                        className="w-3 h-3 text-primary-60"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </span>
                    <span className="text-[13px] sm:text-base text-gray-70">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm text-gray-50 bg-gray-5 rounded-lg p-4">
                위 항목 중 불확실한 사항이 있어도 괜찮습니다. 무료 상담을 통해
                전문가가 정확한 자격 여부를 확인해드립니다.
              </p>
            </div>
          </div>
        </section>
      </ScrollReveal>
      {/* 하단 CTA */}
      <ScrollReveal>
        <section className="py-16 bg-white">
          <div className="max-w-[600px] mx-auto px-6 text-center">
            <h2 className="text-2xl font-bold text-gray-90 mb-4">
              지금 바로 무료상담을 신청하세요
            </h2>
            <p className="text-gray-50 mb-8">
              복잡한 정책자금, 전문가와 함께하면 쉽습니다
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/contact"
                className="bg-primary-60 hover:bg-primary-70 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
              >
                무료상담 신청
              </Link>
              <a
                href="tel:010-2020-5312"
                className="border border-primary-40 text-primary-60 hover:bg-primary-5 font-semibold px-8 py-3 rounded-lg transition-colors"
              >
                전화상담
              </a>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </>
  );
}
