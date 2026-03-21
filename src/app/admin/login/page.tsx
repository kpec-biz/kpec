"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || "";

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const requestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${WORKER_URL}/api/admin-auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
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
        body: JSON.stringify({ email, code: otp }),
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
          {step === "email" ? (
            <form onSubmit={requestOtp}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                관리자 이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1A56A8] focus:ring-2 focus:ring-[#1A56A8]/20 outline-none transition-all text-sm"
              />
              <p className="text-xs text-gray-400 mt-2">
                등록된 이메일로 Telegram OTP가 발송됩니다.
              </p>

              {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-3 bg-[#1A56A8] hover:bg-[#134A8A] text-white font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? "발송 중..." : "인증코드 요청"}
              </button>
            </form>
          ) : (
            <form onSubmit={verifyOtp}>
              <p className="text-sm text-gray-600 mb-4">
                Telegram으로 발송된 6자리 코드를 입력하세요.
              </p>
              <input
                type="text"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                required
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1A56A8] focus:ring-2 focus:ring-[#1A56A8]/20 outline-none transition-all text-center text-2xl tracking-[0.5em] font-mono"
              />

              {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

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
                  setStep("email");
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
