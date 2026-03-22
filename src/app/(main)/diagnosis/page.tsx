"use client";

import { useState } from "react";

type Step = 1 | 2 | 3 | "result";

const industries = [
  { label: "제조", icon: "🏭", value: "제조" },
  { label: "IT", icon: "💻", value: "IT" },
  { label: "서비스", icon: "🏢", value: "서비스" },
  { label: "건설", icon: "🏗️", value: "건설" },
  { label: "유통", icon: "📦", value: "유통" },
  { label: "기타", icon: "🔧", value: "기타" },
];

const operationYears = ["1년 미만", "1~3년", "3~7년", "7년 이상"];
const revenues = ["1억 미만", "1~5억", "5~30억", "30억 이상"];
const locationOptions = ["수도권", "비수도권"];

const fundGoals = [
  {
    label: "운전자금",
    desc: "원자재·인건비 등 운영비",
    value: "운전자금",
    color: "bg-primary-5 border-primary-20",
  },
  {
    label: "시설자금",
    desc: "설비·공장 구축 확장",
    value: "시설자금",
    color: "bg-gray-5 border-gray-20",
  },
  {
    label: "기업인증",
    desc: "벤처·이노비즈·메인비즈",
    value: "기업인증",
    color: "bg-success/5 border-success/20",
  },
  {
    label: "수출지원",
    desc: "해외시장 진출 자금",
    value: "수출지원",
    color: "bg-point-50/5 border-point-50/20",
  },
];

interface DiagResult {
  name: string;
  rate: string;
  limit: string;
  match: string;
  color: string;
}

function getResults(
  industry: string,
  goal: string,
  location: string,
  year: string,
): DiagResult[] {
  const results: DiagResult[] = [];
  const isNonCapital = location === "비수도권";
  const rateAdj = isNonCapital ? " (비수도권 -0.2%p 우대)" : "";

  if (goal === "운전자금") {
    const baseRate = isNonCapital ? "연 2.3%" : "연 2.5%";
    results.push({
      name: "혁신창업사업화자금",
      rate: baseRate + rateAdj,
      limit: "최대 5억원",
      match: "높음",
      color: "border-l-primary-60",
    });
    results.push({
      name: "신성장기반자금",
      rate: baseRate + rateAdj,
      limit: "최대 5억원",
      match: "중간",
      color: "border-l-primary-40",
    });
    if (year === "1년 미만" || year === "1~3년") {
      results.push({
        name: "청년전용창업자금",
        rate: "연 2.5%",
        limit: "1~2억원",
        match: "해당 시",
        color: "border-l-success",
      });
    }
  }
  if (goal === "시설자금") {
    const baseRate = isNonCapital ? "연 2.3%" : "연 2.5%";
    results.push({
      name: "신성장기반자금 (시설)",
      rate: baseRate + rateAdj,
      limit: "최대 60억원",
      match: "높음",
      color: "border-l-primary-60",
    });
    results.push({
      name: "신시장진출지원자금 (시설)",
      rate: baseRate + rateAdj,
      limit: "최대 60억원",
      match: "중간",
      color: "border-l-primary-40",
    });
  }
  if (goal === "기업인증") {
    results.push({
      name: "벤처기업 인증",
      rate: "법인세 50% 감면 (5년)",
      limit: "정책자금 우선 배정",
      match: "높음",
      color: "border-l-success",
    });
    results.push({
      name: "이노비즈(INNO-BIZ)",
      rate: "보증료 -0.2%p",
      limit: "공공조달 가점",
      match: "중간",
      color: "border-l-primary-60",
    });
    results.push({
      name: "메인비즈(MAIN-BIZ)",
      rate: "융자한도 최대 70억",
      limit: "컨설팅·판로 지원",
      match: "중간",
      color: "border-l-primary-40",
    });
  }
  if (goal === "수출지원") {
    const baseRate = isNonCapital ? "연 2.3%" : "연 2.5%";
    results.push({
      name: "신시장진출지원자금",
      rate: baseRate + rateAdj,
      limit: "최대 10억원",
      match: "높음",
      color: "border-l-primary-60",
    });
    results.push({
      name: "내수기업 수출기업화자금",
      rate: baseRate + rateAdj,
      limit: "최대 10억원",
      match: "높음",
      color: "border-l-point-50",
    });
  }

  return results;
}

export default function DiagnosisPage() {
  const [step, setStep] = useState<Step>(1);
  const [selected, setSelected] = useState({
    industry: "",
    year: "",
    revenue: "",
    location: "",
    goal: "",
  });
  const [contact, setContact] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const results = getResults(
    selected.industry,
    selected.goal,
    selected.location,
    selected.year,
  );

  return (
    <div className="min-h-screen bg-gray-5">
      <div className="pt-16" />
      <section className="py-12">
        <div className="max-w-[700px] mx-auto px-6">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-90 mb-3">
              자금 적격 진단
            </h1>
            <p className="text-gray-50">
              3단계로 내 기업에 맞는 정책자금을 확인하세요
            </p>
          </div>

          {/* 스텝 인디케이터 */}
          {step !== "result" && (
            <div className="flex items-center gap-2 mb-8 justify-center">
              {([1, 2, 3] as const).map((s) => {
                const isDone = typeof step === "number" && s < step;
                const isActive = step === s;
                return (
                  <div key={s} className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        isDone
                          ? "bg-primary-60 text-white"
                          : isActive
                            ? "bg-white border-2 border-primary-60 text-primary-60"
                            : "bg-white border-2 border-gray-20 text-gray-30"
                      }`}
                    >
                      {isDone ? "✓" : s}
                    </div>
                    {s < 3 && (
                      <div
                        className={`w-12 h-0.5 ${isDone ? "bg-primary-60" : "bg-gray-20"}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Step 1: 업종 선택 */}
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-gray-10 p-8">
              <h2 className="text-xl font-bold text-gray-90 mb-6 text-center">
                기업의 업종을 선택해주세요
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {industries.map((ind) => (
                  <button
                    key={ind.value}
                    onClick={() => {
                      setSelected({ ...selected, industry: ind.value });
                      setTimeout(() => setStep(2), 200);
                    }}
                    className={`flex flex-col items-center gap-3 py-6 rounded-xl border-2 transition-all hover:shadow-md ${
                      selected.industry === ind.value
                        ? "border-primary-60 bg-primary-5 scale-[1.02]"
                        : "border-gray-10 hover:border-primary-20"
                    }`}
                  >
                    <span className="text-3xl">{ind.icon}</span>
                    <span className="text-sm font-semibold text-gray-80">
                      {ind.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: 경영 현황 */}
          {step === 2 && (
            <div className="bg-white rounded-2xl border border-gray-10 p-8">
              <h2 className="text-xl font-bold text-gray-90 mb-6 text-center">
                경영 현황을 선택해주세요
              </h2>
              <div className="space-y-5">
                <div>
                  <p className="text-sm font-medium text-gray-70 mb-2">업력</p>
                  <div className="flex flex-wrap gap-2">
                    {operationYears.map((y) => (
                      <button
                        key={y}
                        onClick={() => setSelected({ ...selected, year: y })}
                        className={`px-4 py-2 rounded-full text-sm border-2 transition-all ${
                          selected.year === y
                            ? "border-primary-60 bg-primary-5 text-primary-60 font-semibold"
                            : "border-gray-20 text-gray-60 hover:border-primary-20"
                        }`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-70 mb-2">
                    연 매출
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {revenues.map((r) => (
                      <button
                        key={r}
                        onClick={() => setSelected({ ...selected, revenue: r })}
                        className={`px-4 py-2 rounded-full text-sm border-2 transition-all ${
                          selected.revenue === r
                            ? "border-primary-60 bg-primary-5 text-primary-60 font-semibold"
                            : "border-gray-20 text-gray-60 hover:border-primary-20"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-70 mb-2">
                    사업장 소재지
                  </p>
                  <div className="flex gap-2">
                    {locationOptions.map((loc) => (
                      <button
                        key={loc}
                        onClick={() =>
                          setSelected({ ...selected, location: loc })
                        }
                        className={`px-4 py-2 rounded-full text-sm border-2 transition-all ${
                          selected.location === loc
                            ? "border-primary-60 bg-primary-5 text-primary-60 font-semibold"
                            : "border-gray-20 text-gray-60 hover:border-primary-20"
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-gray-20 rounded-lg text-sm font-semibold text-gray-60 hover:border-gray-40 transition-colors"
                >
                  이전
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={
                    !selected.year || !selected.revenue || !selected.location
                  }
                  className="flex-1 py-3 bg-primary-60 hover:bg-primary-70 disabled:bg-gray-20 disabled:text-gray-40 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  다음
                </button>
              </div>
            </div>
          )}

          {/* Step 3: 자금 용도 */}
          {step === 3 && (
            <div className="bg-white rounded-2xl border border-gray-10 p-8">
              <h2 className="text-xl font-bold text-gray-90 mb-6 text-center">
                필요한 자금 용도를 선택해주세요
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {fundGoals.map((goal) => (
                  <button
                    key={goal.value}
                    onClick={() => {
                      setSelected({ ...selected, goal: goal.value });
                      setTimeout(() => setStep("result"), 300);
                    }}
                    className={`flex flex-col items-start gap-1.5 p-5 rounded-xl border-2 transition-all hover:shadow-md text-left ${
                      selected.goal === goal.value
                        ? `${goal.color} scale-[1.02]`
                        : "border-gray-10 hover:border-primary-20"
                    }`}
                  >
                    <span className="font-bold text-gray-90">{goal.label}</span>
                    <span className="text-xs text-gray-50">{goal.desc}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full mt-6 py-3 border border-gray-20 rounded-lg text-sm font-semibold text-gray-60 hover:border-gray-40 transition-colors"
              >
                이전
              </button>
            </div>
          )}

          {/* 결과 */}
          {step === "result" && (
            <div className="space-y-4">
              <div className="bg-primary-80 rounded-2xl p-6 text-center text-white">
                <p className="text-sm font-medium text-white/70 mb-1">
                  진단 완료
                </p>
                <h2 className="text-xl font-bold mb-2">
                  {selected.industry} 업종 · {selected.goal} 맞춤 결과
                </h2>
                <p className="text-white/60 text-sm">
                  {selected.location === "비수도권"
                    ? "비수도권 우대금리 -0.2%p 적용"
                    : "수도권 기준 금리 적용"}
                </p>
              </div>

              {results.map((res, i) => (
                <div
                  key={i}
                  className={`bg-white rounded-xl border border-gray-10 border-l-4 ${res.color} p-5`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-90">{res.name}</h3>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        res.match === "높음"
                          ? "bg-success/10 text-success"
                          : "bg-gray-10 text-gray-60"
                      }`}
                    >
                      적합도: {res.match}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-40 text-xs mb-0.5">금리</p>
                      <p className="text-gray-80 font-medium">{res.rate}</p>
                    </div>
                    <div>
                      <p className="text-gray-40 text-xs mb-0.5">한도</p>
                      <p className="text-gray-80 font-medium">{res.limit}</p>
                    </div>
                  </div>
                </div>
              ))}

              {submitted ? (
                <div className="bg-success/5 border border-success/20 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#16a34a"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <p className="font-bold text-gray-90 mb-1">
                    접수가 완료되었습니다
                  </p>
                  <p className="text-sm text-gray-50">
                    담당 전문가가 빠르게 연락드리겠습니다.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-10 p-6">
                  <p className="font-bold text-gray-90 mb-1 text-center">
                    전문가 상담 접수
                  </p>
                  <p className="text-sm text-gray-50 mb-5 text-center">
                    진단 결과를 바탕으로 전문가가 맞춤 상담을 드립니다.
                  </p>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="이름 *"
                      value={contact.name}
                      onChange={(e) =>
                        setContact({ ...contact, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-20 rounded-lg text-sm focus:border-primary-60 focus:outline-none transition-colors"
                    />
                    <input
                      type="tel"
                      placeholder="연락처 *"
                      value={contact.phone}
                      onChange={(e) =>
                        setContact({ ...contact, phone: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-20 rounded-lg text-sm focus:border-primary-60 focus:outline-none transition-colors"
                    />
                    <input
                      type="email"
                      placeholder="이메일"
                      value={contact.email}
                      onChange={(e) =>
                        setContact({ ...contact, email: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-20 rounded-lg text-sm focus:border-primary-60 focus:outline-none transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="상호명 *"
                      value={contact.company}
                      onChange={(e) =>
                        setContact({ ...contact, company: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-20 rounded-lg text-sm focus:border-primary-60 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={async () => {
                        if (!contact.name || !contact.phone || !contact.company)
                          return;
                        setSubmitting(true);
                        try {
                          const workerUrl =
                            process.env.NEXT_PUBLIC_WORKER_URL || "";
                          await fetch(`${workerUrl}/api/inquiry`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              name: contact.name,
                              phone: contact.phone,
                              email: contact.email,
                              company: contact.company,
                              industry: selected.industry,
                              location: selected.location,
                              operationYear: selected.year,
                              revenue: selected.revenue,
                              fundTypes: selected.goal,
                              amount: selected.goal,
                              type: "diagnosis",
                              source: "diagnosis-wizard",
                              message: `[자금진단] ${selected.industry} / ${selected.goal} / ${selected.location} / 업력 ${selected.year} / 매출 ${selected.revenue}`,
                            }),
                          });
                          setSubmitted(true);
                        } catch {
                          alert(
                            "접수 중 오류가 발생했습니다. 다시 시도해주세요.",
                          );
                        } finally {
                          setSubmitting(false);
                        }
                      }}
                      disabled={
                        !contact.name ||
                        !contact.phone ||
                        !contact.company ||
                        submitting
                      }
                      className="flex-1 bg-primary-60 hover:bg-primary-70 disabled:bg-gray-20 disabled:text-gray-40 text-white font-semibold py-3 rounded-lg text-sm transition-colors"
                    >
                      {submitting ? "접수 중..." : "상담 접수하기"}
                    </button>
                    <button
                      onClick={() => {
                        setStep(1);
                        setSelected({
                          industry: "",
                          year: "",
                          revenue: "",
                          location: "",
                          goal: "",
                        });
                        setContact({
                          name: "",
                          phone: "",
                          email: "",
                          company: "",
                        });
                      }}
                      className="flex-1 border border-gray-20 text-gray-60 hover:border-gray-40 font-semibold py-3 rounded-lg text-sm transition-colors"
                    >
                      다시 진단하기
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-30 mt-3 text-center">
                    ※ 후불 성공보수제 · 무료상담
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
