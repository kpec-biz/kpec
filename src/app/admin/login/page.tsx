"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || "";

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "otp">("request");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const requestOtp = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${WORKER_URL}/api/admin-auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "인증 요청 실패");
      }

      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "인증 요청 실패");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${WORKER_URL}/api/admin-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: otp }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "인증 실패");
      }

      const data = await res.json();
      localStorage.setItem("kpec_admin_token", data.token);
      router.replace("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "인증 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          "linear-gradient(135deg, #0e2a5c 0%, #1A56A8 50%, #134A8A 100%)",
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1">
            <span className="text-5xl font-black text-[#ED2939]">K</span>
            <span className="text-5xl font-light text-white">PEC</span>
          </div>
          <p className="text-white/60 text-sm mt-2">관리자 로그인</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {step === "request" ? (
            <div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#0088cc]/10 flex items-center justify-center">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-[#0088cc]"
                  >
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  텔레그램 인증
                </h2>
                <p className="text-sm text-gray-500">
                  버튼을 누르면 텔레그램으로
                  <br />
                  6자리 인증코드가 발송됩니다
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-500 mb-4 text-center">{error}</p>
              )}

              <button
                onClick={requestOtp}
                disabled={loading}
                className="w-full py-3 bg-[#0088cc] hover:bg-[#006699] text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    발송 중...
                  </>
                ) : (
                  "인증코드 요청"
                )}
              </button>
            </div>
          ) : (
            <form onSubmit={verifyOtp}>
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                  텔레그램으로 발송된 6자리 코드를 입력하세요
                </p>
              </div>
              <input
                type="text"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                required
                maxLength={6}
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1A56A8] focus:ring-2 focus:ring-[#1A56A8]/20 outline-none transition-all text-center text-2xl tracking-[0.5em] font-mono"
              />

              {error && (
                <p className="text-sm text-red-500 mt-3 text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full mt-6 py-3 bg-[#1A56A8] hover:bg-[#134A8A] text-white font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? "확인 중..." : "로그인"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("request");
                  setOtp("");
                  setError("");
                }}
                className="w-full mt-2 py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                다시 요청하기
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
