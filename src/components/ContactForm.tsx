"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";

const situations = [
  "신규 자금 필요",
  "기존 대출 금리 절감",
  "사업 확장 자금",
  "기업 인증 필요",
  "창업 자금 필요",
  "운전자금 부족",
];

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    company: "",
    industry: "",
    name: "",
    phone: "",
    location: "",
    creditScore: "",
    revenue: "",
    amount: "",
    situations: [] as string[],
    message: "",
    privacy: false,
  });

  const handleSituationToggle = (s: string) => {
    setFormData((prev) => ({
      ...prev,
      situations: prev.situations.includes(s)
        ? prev.situations.filter((x) => x !== s)
        : [...prev.situations, s],
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (
      !formData.company ||
      !formData.name ||
      !formData.phone ||
      !formData.privacy
    ) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }
    // 즉시 완료 화면 → 백그라운드 저장
    setSubmitted(true);
    const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL || "";
    fetch(`${workerUrl}/api/inquiry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        fundTypes: formData.situations,
        type: "general",
        source: "contact-form",
      }),
    }).catch(() => {});
  };

  if (submitted) {
    return (
      <section className="py-20 sm:py-28 bg-gray-light">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-12 shadow-lg"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 text-accent mb-6">
              <svg
                className="w-8 h-8"
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
            <h3 className="text-2xl font-bold text-dark mb-3">
              상담 신청이 완료되었습니다
            </h3>
            <p className="text-gray-500 mb-6">
              전문 컨설턴트가 빠른 시간 내에 연락드리겠습니다.
            </p>
            <a
              href="tel:01084176800"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-semibold transition-colors"
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
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              지금 바로 전화하기
            </a>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 sm:py-28 bg-gray-light">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block bg-accent/10 text-accent-dark px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            무료상담
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-dark mb-4">
            무료상담 신청
          </h2>
          <p className="text-gray-500 text-lg">
            아래 양식을 작성해주시면 전문 컨설턴트가 상담해드립니다
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-gray-100"
        >
          {/* Required Fields */}
          <div className="mb-8">
            <h4 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
              필수 입력
            </h4>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  label: "회사명",
                  key: "company",
                  placeholder: "회사명을 입력하세요",
                  type: "text",
                },
                {
                  label: "업종",
                  key: "industry",
                  placeholder: "업종을 입력하세요",
                  type: "text",
                },
                {
                  label: "대표자명",
                  key: "name",
                  placeholder: "대표자명을 입력하세요",
                  type: "text",
                },
                {
                  label: "연락처",
                  key: "phone",
                  placeholder: "010-0000-0000",
                  type: "tel",
                },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {field.label} <span className="text-accent-dark">*</span>
                  </label>
                  <input
                    type={field.type}
                    value={
                      formData[field.key as keyof typeof formData] as string
                    }
                    onChange={(e) =>
                      setFormData({ ...formData, [field.key]: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                    placeholder={field.placeholder}
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Optional Fields */}
          <div className="mb-8">
            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              선택 입력
            </h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  사업장 소재지
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                  placeholder="예: 서울시 강남구"
                />
              </div>
              {[
                {
                  label: "신용점수",
                  key: "creditScore",
                  options: [
                    "900점 이상",
                    "800~899점",
                    "700~799점",
                    "600~699점",
                    "600점 미만",
                    "모르겠음",
                  ],
                },
                {
                  label: "연매출",
                  key: "revenue",
                  options: [
                    "1억 미만",
                    "1억~5억",
                    "5억~10억",
                    "10억~50억",
                    "50억 이상",
                  ],
                },
                {
                  label: "필요자금",
                  key: "amount",
                  options: [
                    "1억 미만",
                    "1억~3억",
                    "3억~5억",
                    "5억~10억",
                    "10억 이상",
                  ],
                },
              ].map((sel) => (
                <div key={sel.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {sel.label}
                  </label>
                  <select
                    value={formData[sel.key as keyof typeof formData] as string}
                    onChange={(e) =>
                      setFormData({ ...formData, [sel.key]: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                  >
                    <option value="">선택하세요</option>
                    {sel.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Situations */}
          <div className="mb-8">
            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              현재 상황 (복수 선택 가능)
            </h4>
            <div className="flex flex-wrap gap-2">
              {situations.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSituationToggle(s)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    formData.situations.includes(s)
                      ? "bg-dark text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              문의내용
            </label>
            <textarea
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm resize-none"
              placeholder="추가 문의사항이 있으시면 입력해주세요"
            />
          </div>

          {/* Privacy */}
          <div className="mb-8">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.privacy}
                onChange={(e) =>
                  setFormData({ ...formData, privacy: e.target.checked })
                }
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary mt-0.5"
              />
              <span className="text-sm text-gray-600">
                <span className="font-medium text-gray-700">
                  개인정보 수집 및 이용에 동의합니다.
                </span>
                <span className="text-accent-dark ml-1">*</span>
                <br />
                <span className="text-xs text-gray-400">
                  수집항목: 회사명, 대표자명, 연락처 | 이용목적: 상담 서비스
                  제공 | 보유기간: 상담 완료 후 1년
                </span>
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-accent hover:bg-accent-dark text-primary py-4 rounded-xl text-lg font-semibold transition-all hover:shadow-lg hover:shadow-accent/25"
          >
            무료상담 신청하기
          </button>
        </motion.form>
      </div>
    </section>
  );
}
