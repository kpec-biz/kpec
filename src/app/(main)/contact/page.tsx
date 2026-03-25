"use client";

import { useState } from "react";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import { r2 } from "@/lib/r2-images";

type StepKey = 1 | 2 | 3 | 4;

const stepLabels: Record<StepKey, string> = {
  1: "기본정보",
  2: "기업현황",
  3: "상담내용",
  4: "확인제출",
};

const industries = [
  "제조업",
  "IT/소프트웨어",
  "서비스업",
  "건설업",
  "유통/물류",
  "기타",
];
const fundTypes = ["운전자금", "시설자금", "기업인증", "수출지원"];
const revenues = ["1억 미만", "1~5억", "5~10억", "10~50억", "50억 이상"];
const operationYears = ["1년 미만", "1~3년", "3~7년", "7년 이상"];
const locations = [
  "서울",
  "경기·인천",
  "충청·세종",
  "전라·광주",
  "경상·부산·대구·울산",
  "강원·제주",
];

interface FormState {
  // Step 1
  name: string;
  phone: string;
  email: string;
  // Step 2
  company: string;
  industry: string;
  revenue: string;
  operationYear: string;
  location: string;
  // Step 3
  fundTypes: string[];
  amount: string;
  message: string;
  privacy: boolean;
}

export default function ContactPage() {
  const [step, setStep] = useState<StepKey>(1);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    email: "",
    company: "",
    industry: "",
    revenue: "",
    operationYear: "",
    location: "",
    fundTypes: [],
    amount: "",
    message: "",
    privacy: false,
  });

  const toggleFundType = (t: string) => {
    setForm((prev) => ({
      ...prev,
      fundTypes: prev.fundTypes.includes(t)
        ? prev.fundTypes.filter((x) => x !== t)
        : [...prev.fundTypes, t],
    }));
  };

  const filledFields = Object.entries(form).filter(([k, v]) => {
    if (k === "privacy") return false;
    if (Array.isArray(v)) return v.length > 0;
    return v !== "";
  });

  const canNext = () => {
    if (step === 1) return form.name && form.phone;
    if (step === 2) return form.company && form.industry;
    if (step === 3) return form.fundTypes.length > 0;
    return form.privacy;
  };

  const handleSubmit = () => {
    if (!form.privacy) {
      alert("개인정보 수집·이용 동의가 필요합니다.");
      return;
    }
    // 즉시 완료 화면 → 백그라운드 저장
    setSubmitted(true);
    const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL || "";
    fetch(`${workerUrl}/api/inquiry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        type: "general",
        source: "contact-wizard",
      }),
    }).catch(() => {});
  };

  if (submitted) {
    return (
      <>
        <PageHeader
          bgImage="/images/headers/contact.png"
          title="무료상담 신청"
          subtitle="전문 컨설턴트가 맞춤형 정책자금을 안내합니다"
        />
        <section className="py-24 bg-gray-5">
          <div className="max-w-lg mx-auto px-6 text-center">
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-10">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-success"
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
              </div>
              <h2 className="text-2xl font-bold text-gray-90 mb-3">
                상담 신청이 완료되었습니다
              </h2>
              <p className="text-gray-50 mb-2">
                <strong className="text-gray-80">{form.name}</strong>님, 신청
                감사합니다.
              </p>
              <p className="text-gray-50 text-sm">
                영업일 기준 1~2일 내 연락드리겠습니다.
              </p>
              <p className="mt-4 text-sm text-primary-60 font-semibold">
                📞 010-8417-6800
              </p>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        bgImage="/images/headers/contact.png"
        title="무료상담 신청"
        subtitle="전문 컨설턴트가 맞춤형 정책자금을 안내합니다"
      />

      <section className="py-12 bg-gray-5">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid lg:grid-cols-[260px_1fr_280px] gap-8">
            {/* 왼쪽: 컨셉이미지 + CTA */}
            <div className="hidden lg:flex flex-col">
              <div className="bg-white rounded-xl border border-gray-10 overflow-hidden mb-4">
                <div className="relative aspect-[3/4] bg-primary-5">
                  <Image
                    src={r2("/images/banners/consultant-portrait.png")}
                    alt="정책자금 상담"
                    fill
                    className="object-cover object-top"
                  />
                </div>
                <div className="p-5">
                  <p className="font-bold text-gray-90">
                    복잡한 서류, 까다로운 조건
                  </p>
                  <p className="text-sm text-gray-50 mt-1">
                    전문가가 처음부터 끝까지 함께합니다
                  </p>
                  <a
                    href="tel:01084176800"
                    className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-point-50 text-white rounded-lg font-semibold text-sm hover:bg-point-60 transition-colors"
                  >
                    전화상담 010-8417-6800
                  </a>
                  <p className="text-xs text-gray-40 text-center mt-2">
                    평일 09:00 ~ 18:00
                  </p>
                </div>
              </div>
            </div>

            {/* 중앙: 위저드 폼 */}
            <div className="bg-white rounded-xl border border-gray-10 overflow-hidden">
              {/* 스텝 진행바 - 상단 고정 스타일 */}
              <div className="border-b border-gray-10 px-6 pt-6 pb-4 bg-white">
                {/* 프로그레스 바 */}
                <div className="w-full bg-gray-10 rounded-full h-1.5 mb-5">
                  <div
                    className="bg-primary-60 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${(step / 4) * 100}%` }}
                  />
                </div>
                {/* 원형 스텝 넘버 */}
                <div className="flex items-center justify-between">
                  {([1, 2, 3, 4] as StepKey[]).map((s) => {
                    const isDone = s < step;
                    const isActive = s === step;
                    return (
                      <div
                        key={s}
                        className="flex flex-col items-center gap-1.5"
                      >
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                            isDone
                              ? "bg-primary-60 border-primary-60 text-white"
                              : isActive
                                ? "bg-white border-primary-60 text-primary-60"
                                : "bg-white border-gray-20 text-gray-40"
                          }`}
                        >
                          {isDone ? (
                            <svg
                              className="w-4 h-4"
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
                          ) : (
                            s
                          )}
                        </div>
                        <span
                          className={`text-xs font-medium ${isActive ? "text-primary-60" : isDone ? "text-gray-60" : "text-gray-30"}`}
                        >
                          {stepLabels[s]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 폼 본문 */}
              <div className="p-6">
                {step === 1 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-90 mb-5">
                      기본 정보를 입력해주세요
                    </h2>
                    <div>
                      <label className="block text-sm font-medium text-gray-70 mb-1.5">
                        담당자명 <span className="text-point-50">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        placeholder="홍길동"
                        className="w-full border border-gray-20 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-40 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-70 mb-1.5">
                        연락처 <span className="text-point-50">*</span>
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) =>
                          setForm({ ...form, phone: e.target.value })
                        }
                        placeholder="010-0000-0000"
                        className="w-full border border-gray-20 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-40 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-70 mb-1.5">
                        이메일 (선택)
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        placeholder="example@email.com"
                        className="w-full border border-gray-20 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-40 transition-colors"
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-90 mb-5">
                      기업 현황을 알려주세요
                    </h2>
                    <div>
                      <label className="block text-sm font-medium text-gray-70 mb-1.5">
                        기업명 <span className="text-point-50">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.company}
                        onChange={(e) =>
                          setForm({ ...form, company: e.target.value })
                        }
                        placeholder="(주)회사명"
                        className="w-full border border-gray-20 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-40 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-70 mb-1.5">
                        업종 <span className="text-point-50">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {industries.map((ind) => (
                          <button
                            key={ind}
                            onClick={() => setForm({ ...form, industry: ind })}
                            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                              form.industry === ind
                                ? "bg-primary-60 border-primary-60 text-white"
                                : "border-gray-20 text-gray-60 hover:border-primary-40 hover:text-primary-60"
                            }`}
                          >
                            {ind}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-70 mb-1.5">
                          연 매출
                        </label>
                        <select
                          value={form.revenue}
                          onChange={(e) =>
                            setForm({ ...form, revenue: e.target.value })
                          }
                          className="w-full border border-gray-20 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-40"
                        >
                          <option value="">선택</option>
                          {revenues.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-70 mb-1.5">
                          업력
                        </label>
                        <select
                          value={form.operationYear}
                          onChange={(e) =>
                            setForm({ ...form, operationYear: e.target.value })
                          }
                          className="w-full border border-gray-20 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-40"
                        >
                          <option value="">선택</option>
                          {operationYears.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-70 mb-1.5">
                        소재지
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {locations.map((loc) => (
                          <button
                            key={loc}
                            onClick={() => setForm({ ...form, location: loc })}
                            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                              form.location === loc
                                ? "bg-primary-60 border-primary-60 text-white"
                                : "border-gray-20 text-gray-60 hover:border-primary-40 hover:text-primary-60"
                            }`}
                          >
                            {loc}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-90 mb-5">
                      상담 내용을 알려주세요
                    </h2>
                    <div>
                      <label className="block text-sm font-medium text-gray-70 mb-2">
                        필요한 자금 유형{" "}
                        <span className="text-point-50">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {fundTypes.map((t) => (
                          <button
                            key={t}
                            onClick={() => toggleFundType(t)}
                            className={`py-3 rounded-lg text-sm font-medium border-2 transition-colors ${
                              form.fundTypes.includes(t)
                                ? "bg-primary-5 border-primary-40 text-primary-60"
                                : "border-gray-10 text-gray-60 hover:border-primary-20"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-70 mb-1.5">
                        희망 금액 (선택)
                      </label>
                      <input
                        type="text"
                        value={form.amount}
                        onChange={(e) =>
                          setForm({ ...form, amount: e.target.value })
                        }
                        placeholder="예: 5억원"
                        className="w-full border border-gray-20 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-40 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-70 mb-1.5">
                        추가 문의사항 (선택)
                      </label>
                      <textarea
                        value={form.message}
                        onChange={(e) =>
                          setForm({ ...form, message: e.target.value })
                        }
                        rows={4}
                        placeholder="궁금한 점을 자유롭게 작성해주세요"
                        className="w-full border border-gray-20 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-40 transition-colors resize-none"
                      />
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-5">
                    <h2 className="text-lg font-bold text-gray-90 mb-5">
                      입력 내용을 확인해주세요
                    </h2>
                    <div className="bg-gray-5 rounded-xl p-5 space-y-3 text-sm">
                      {[
                        ["담당자", form.name],
                        ["연락처", form.phone],
                        ["이메일", form.email || "-"],
                        ["기업명", form.company || "-"],
                        ["업종", form.industry || "-"],
                        ["연 매출", form.revenue || "-"],
                        ["업력", form.operationYear || "-"],
                        ["소재지", form.location || "-"],
                        ["자금 유형", form.fundTypes.join(", ") || "-"],
                        ["희망 금액", form.amount || "-"],
                      ].map(([label, value]) => (
                        <div key={label} className="flex gap-4">
                          <span className="text-gray-40 w-20 flex-shrink-0">
                            {label}
                          </span>
                          <span className="text-gray-80 font-medium">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.privacy}
                        onChange={(e) =>
                          setForm({ ...form, privacy: e.target.checked })
                        }
                        className="mt-0.5 w-4 h-4 accent-primary-60"
                      />
                      <span className="text-sm text-gray-60">
                        <span className="text-point-50 font-semibold">
                          [필수]
                        </span>{" "}
                        개인정보 수집·이용에 동의합니다.{" "}
                        <a
                          href="/privacy"
                          className="underline text-primary-60 hover:text-primary-70"
                        >
                          개인정보처리방침
                        </a>
                      </span>
                    </label>
                  </div>
                )}

                {/* 버튼 */}
                <div className="flex gap-3 mt-8">
                  {step > 1 && (
                    <button
                      onClick={() => setStep((s) => (s - 1) as StepKey)}
                      className="flex-1 py-3 border border-gray-20 rounded-lg text-sm font-semibold text-gray-60 hover:border-gray-40 transition-colors"
                    >
                      이전
                    </button>
                  )}
                  {step < 4 ? (
                    <button
                      onClick={() => setStep((s) => (s + 1) as StepKey)}
                      disabled={!canNext()}
                      className="flex-1 py-3 bg-primary-60 hover:bg-primary-70 disabled:bg-gray-20 disabled:text-gray-40 text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                      다음
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={!form.privacy}
                      className="flex-1 py-3 bg-primary-60 hover:bg-primary-70 disabled:bg-gray-20 disabled:text-gray-40 text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                      상담 신청 완료
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 오른쪽: 실시간 미리보기 */}
            <div className="hidden lg:block space-y-4">
              <div className="bg-white rounded-xl border border-gray-10 p-5">
                <h3 className="font-bold text-gray-80 mb-3">진행 현황</h3>
                {/* 진행률 바 */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-50 mb-1.5">
                    <span>입력 완성도</span>
                    <span className="font-semibold text-primary-60">
                      {Math.round((filledFields.length / 10) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-10 rounded-full h-2">
                    <div
                      className="bg-primary-60 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min((filledFields.length / 10) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* 입력된 항목만 표시 */}
                <div className="space-y-2 text-sm">
                  {form.name && (
                    <div className="flex gap-2">
                      <span className="text-gray-40 w-16 flex-shrink-0">
                        담당자
                      </span>
                      <span className="text-gray-70 font-medium">
                        {form.name}
                      </span>
                    </div>
                  )}
                  {form.company && (
                    <div className="flex gap-2">
                      <span className="text-gray-40 w-16 flex-shrink-0">
                        기업명
                      </span>
                      <span className="text-gray-70 font-medium">
                        {form.company}
                      </span>
                    </div>
                  )}
                  {form.industry && (
                    <div className="flex gap-2">
                      <span className="text-gray-40 w-16 flex-shrink-0">
                        업종
                      </span>
                      <span className="text-gray-70 font-medium">
                        {form.industry}
                      </span>
                    </div>
                  )}
                  {form.location && (
                    <div className="flex gap-2">
                      <span className="text-gray-40 w-16 flex-shrink-0">
                        소재지
                      </span>
                      <span className="text-gray-70 font-medium">
                        {form.location}
                      </span>
                    </div>
                  )}
                  {form.fundTypes.length > 0 && (
                    <div className="flex gap-2">
                      <span className="text-gray-40 w-16 flex-shrink-0">
                        자금
                      </span>
                      <span className="text-gray-70 font-medium">
                        {form.fundTypes.join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 추천 정책자금 */}
              {form.fundTypes.length > 0 && (
                <div className="bg-primary-5 rounded-xl border border-primary-10 p-5">
                  <h3 className="font-bold text-primary-70 mb-3 text-sm">
                    추천 정책자금
                  </h3>
                  <div className="space-y-2">
                    {form.fundTypes.includes("운전자금") && (
                      <div className="bg-white rounded-lg p-3 text-xs">
                        <p className="font-semibold text-gray-80">
                          혁신창업사업화자금
                        </p>
                        <p className="text-gray-50">연 2.5% · 최대 5억원</p>
                      </div>
                    )}
                    {form.fundTypes.includes("시설자금") && (
                      <div className="bg-white rounded-lg p-3 text-xs">
                        <p className="font-semibold text-gray-80">
                          신성장기반자금
                        </p>
                        <p className="text-gray-50">연 2.5% · 최대 60억원</p>
                      </div>
                    )}
                    {form.fundTypes.includes("기업인증") && (
                      <div className="bg-white rounded-lg p-3 text-xs">
                        <p className="font-semibold text-gray-80">
                          벤처/이노비즈 인증
                        </p>
                        <p className="text-gray-50">세제혜택 + 정책자금 가점</p>
                      </div>
                    )}
                    {form.fundTypes.includes("수출지원") && (
                      <div className="bg-white rounded-lg p-3 text-xs">
                        <p className="font-semibold text-gray-80">
                          신시장진출지원자금
                        </p>
                        <p className="text-gray-50">연 2.5% · 최대 10억원</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 미니 통계 */}
              <div className="bg-white rounded-xl border border-gray-10 p-5">
                <h3 className="font-bold text-gray-80 mb-3 text-sm">
                  KPEC 실적
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "누적 승인", value: "1,247건" },
                    { label: "평균 금리", value: "연 2.3%" },
                    { label: "승인율", value: "94.2%" },
                    { label: "평균 기간", value: "18일" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="text-center bg-gray-5 rounded-lg p-3"
                    >
                      <p className="text-lg font-bold text-primary-60">
                        {stat.value}
                      </p>
                      <p className="text-xs text-gray-50">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
