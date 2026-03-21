"use client";

const pipelineConfigs = [
  {
    name: "정책자금 공고",
    schedule: "매일 09:00",
    source: "기업마당 API",
    status: "active",
    lastRun: "2026-03-21 09:00",
  },
  {
    name: "정책자금 뉴스",
    schedule: "주 3회 (월/수/금)",
    source: "언론보도 수집",
    status: "active",
    lastRun: "2026-03-21 09:00",
  },
  {
    name: "정책자금 분석",
    schedule: "수동 실행",
    source: "gov-posts",
    status: "active",
    lastRun: "2026-03-20 14:00",
  },
  {
    name: "인스타그램 배너",
    schedule: "수동 / 예약",
    source: "자동 생성",
    status: "active",
    lastRun: "2026-03-21 09:00",
  },
];

const apiKeys = [
  { name: "기업마당 API", key: "BIZINFO_API_KEY", status: "valid" },
  { name: "Gemini API", key: "GEMINI_API_KEY", status: "valid" },
  { name: "Airtable", key: "AIRTABLE_BASE_ID", status: "valid" },
  { name: "Telegram Bot", key: "TELEGRAM_BOT_TOKEN", status: "valid" },
  { name: "Meta/Instagram", key: "META_APP_ID", status: "valid" },
  { name: "Cloudflare R2", key: "R2_ACCESS_KEY_ID", status: "valid" },
];

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Pipeline Settings */}
      <div className="bg-white rounded-xl border border-[#1A56A8]/15 p-6">
        <h3 className="font-bold text-[#0e2a5c] mb-4">파이프라인 설정</h3>
        <div className="space-y-3">
          {pipelineConfigs.map((config) => (
            <div
              key={config.name}
              className="flex items-center justify-between p-4 rounded-lg border border-[#1A56A8]/10"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    config.status === "active"
                      ? "bg-green-500 animate-pulse"
                      : "bg-red-400"
                  }`}
                />
                <div>
                  <p className="text-sm font-semibold text-[#0e2a5c]">
                    {config.name}
                  </p>
                  <p className="text-xs text-[#0e2a5c]/50 mt-0.5">
                    {config.source} · {config.schedule}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#0e2a5c]/40">마지막 실행</p>
                <p className="text-xs font-semibold text-[#0e2a5c]">
                  {config.lastRun}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Keys Status */}
      <div className="bg-white rounded-xl border border-[#1A56A8]/15 p-6">
        <h3 className="font-bold text-[#0e2a5c] mb-4">API 연동 상태</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {apiKeys.map((api) => (
            <div
              key={api.key}
              className="flex items-center gap-3 p-3 rounded-lg border border-[#1A56A8]/10"
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  api.status === "valid" ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#0e2a5c]">
                  {api.name}
                </p>
                <p className="text-xs text-[#0e2a5c]/40 truncate">{api.key}</p>
              </div>
              <span
                className={`ml-auto text-xs font-bold px-2 py-0.5 rounded ${
                  api.status === "valid"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {api.status === "valid" ? "정상" : "오류"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl border border-[#1A56A8]/15 p-6">
        <h3 className="font-bold text-[#0e2a5c] mb-4">알림 설정</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-[#1A56A8]/10">
            <div>
              <p className="text-sm font-semibold text-[#0e2a5c]">
                텔레그램 알림
              </p>
              <p className="text-xs text-[#0e2a5c]/50 mt-0.5">
                신규 접수, 파이프라인 완료 시 알림
              </p>
            </div>
            <div className="w-11 h-6 bg-[#1A56A8] rounded-full relative cursor-pointer">
              <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm" />
            </div>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border border-[#1A56A8]/10">
            <div>
              <p className="text-sm font-semibold text-[#0e2a5c]">
                이메일 알림
              </p>
              <p className="text-xs text-[#0e2a5c]/50 mt-0.5">
                일일 리포트 이메일 발송
              </p>
            </div>
            <div className="w-11 h-6 bg-[#1A56A8]/20 rounded-full relative cursor-pointer">
              <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-xl border border-[#1A56A8]/15 p-6">
        <h3 className="font-bold text-[#0e2a5c] mb-4">일반 설정</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#0e2a5c] mb-1.5">
              사이트 제목
            </label>
            <input
              type="text"
              defaultValue="KPEC 한국정책자금평가원"
              className="w-full px-4 py-2.5 rounded-xl border border-[#1A56A8]/20 focus:border-[#1A56A8] focus:ring-2 focus:ring-[#1A56A8]/20 outline-none transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0e2a5c] mb-1.5">
              관리자 이메일
            </label>
            <input
              type="email"
              defaultValue="kpec.fund@gmail.com"
              className="w-full px-4 py-2.5 rounded-xl border border-[#1A56A8]/20 focus:border-[#1A56A8] focus:ring-2 focus:ring-[#1A56A8]/20 outline-none transition-all text-sm"
            />
          </div>
          <button className="px-6 py-2.5 bg-[#1A56A8] text-white rounded-xl text-sm font-medium hover:bg-[#134A8A] transition-colors">
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
