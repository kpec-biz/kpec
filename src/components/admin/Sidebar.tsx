"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminHref, isAdminActive } from "@/lib/admin-utils";

const navSections = [
  {
    title: "관리",
    items: [
      {
        href: "/admin",
        label: "대시보드",
        icon: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
      },
      {
        href: "/admin/inquiries",
        label: "접수 관리",
        icon: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 2h6v4H9z",
      },
    ],
  },
  {
    title: "콘텐츠",
    items: [
      {
        href: "/admin/notices",
        label: "공고 관리",
        icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
      },
      {
        href: "/admin/news",
        label: "뉴스 관리",
        icon: "M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1M15 13h6M15 17h6M15 9h6M3 10h10",
      },
      {
        href: "/admin/analysis",
        label: "분석 관리",
        icon: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
      },
      {
        href: "/admin/instagram",
        label: "인스타그램",
        icon: "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2zM16.5 3.5A1.5 1.5 0 1 0 18 5a1.5 1.5 0 0 0-1.5-1.5zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z",
      },
    ],
  },
  {
    title: "시스템",
    items: [
      {
        href: "/admin/analytics",
        label: "방문통계",
        icon: "M18 20V10M12 20V4M6 20v-6",
      },
      {
        href: "/admin/settings",
        label: "설정",
        icon: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
      },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => isAdminActive(pathname, href);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-[260px] z-50 transition-transform duration-300
          lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          background: "linear-gradient(180deg, #0e2a5c 0%, #1A56A8 100%)",
        }}
      >
        {/* Logo */}
        <div className="h-[70px] flex items-center px-6 border-b border-white/10">
          <Link href={adminHref("/admin")} className="flex items-center gap-2">
            <span className="text-2xl font-black text-[#ED2939]">K</span>
            <span className="text-2xl font-light text-white">PEC</span>
            <span className="text-xs text-white/50 ml-2">Admin</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav
          className="mt-2 px-3 flex flex-col gap-0.5 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 130px)" }}
        >
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="text-[10px] uppercase tracking-wider text-white/30 font-semibold px-4 pt-4 pb-1.5">
                {section.title}
              </p>
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={adminHref(item.href)}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                    ${
                      isActive(item.href)
                        ? "bg-white/20 text-white"
                        : "text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0"
                  >
                    <path d={item.icon} />
                  </svg>
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 text-white/50 hover:text-white text-sm transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            사이트 보기
          </Link>
        </div>
      </aside>
    </>
  );
}
