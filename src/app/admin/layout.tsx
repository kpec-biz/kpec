"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === "/admin/login" || pathname === "/login";

  // 인증 체크
  useEffect(() => {
    if (isLoginPage) {
      setAuthChecked(true);
      return;
    }

    const token = localStorage.getItem("kpec_admin_token");
    if (!token) {
      router.replace("/admin/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token));
      if (payload.exp && payload.exp < Date.now()) {
        localStorage.removeItem("kpec_admin_token");
        router.replace("/admin/login");
        return;
      }
      setIsAuthenticated(true);
    } catch {
      localStorage.removeItem("kpec_admin_token");
      router.replace("/admin/login");
      return;
    }

    setAuthChecked(true);
  }, [pathname, isLoginPage, router]);

  // 로그인 페이지는 레이아웃 없이 렌더링
  if (isLoginPage) {
    return <>{children}</>;
  }

  // 인증 확인 전에는 로딩 화면만 표시 (보안: 대시보드 미노출)
  if (!authChecked || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center gap-1 mb-4">
            <span className="text-3xl font-black text-[#ED2939]">K</span>
            <span className="text-3xl font-light text-[#1A56A8]">PEC</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
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
            <span className="text-sm">인증 확인 중...</span>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("kpec_admin_token");
    router.replace("/admin/login");
  };

  const pageTitleMap: Record<string, string> = {
    "/admin": "대시보드",
    "/admin/inquiries": "접수 관리",
    "/admin/notices": "공고 관리",
    "/admin/news": "뉴스 관리",
    "/admin/analysis": "분석 관리",
    "/admin/instagram": "인스타그램",
    "/admin/board": "게시판 관리",
    "/admin/analytics": "방문통계",
    "/admin/settings": "설정",
  };
  const pageTitle = pageTitleMap[pathname] || "관리자";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-[260px] flex flex-col min-h-screen">
        <header className="h-[70px] bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <h1 className="text-lg font-bold text-gray-900">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">
              관리자
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              로그아웃
            </button>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex lg:hidden z-30 safe-area-bottom">
        {[
          {
            href: "/admin",
            label: "대시보드",
            icon: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
          },
          {
            href: "/admin/inquiries",
            label: "접수",
            icon: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 2h6v4H9z",
          },
          {
            href: "/admin/notices",
            label: "공고",
            icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6",
          },
          {
            href: "/admin/analytics",
            label: "통계",
            icon: "M18 20V10M12 20V4M6 20v-6",
          },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center py-2 text-xs ${
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href))
                ? "text-[#1A56A8]"
                : "text-gray-400"
            }`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={item.icon} />
            </svg>
            <span className="mt-1">{item.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
