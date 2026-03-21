"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "정책자금", href: "/services" },
  // { label: "성공사례", href: "/cases" }, // 사례 등록 전까지 숨김
  { label: "진행절차", href: "/process" },
  { label: "알림·자료", href: "/notice" },
  { label: "상담신청", href: "/contact" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-10 h-16">
      <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 select-none">
          <span className="flex items-center leading-none">
            <span className="text-[22px] font-black text-point-50">K</span>
            <span className="text-[22px] font-light text-primary-60">PEC</span>
          </span>
          <span className="w-px h-5 bg-gray-20" aria-hidden="true" />
          <span className="text-[20px] font-bold text-gray-90">
            기업정책자금센터
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-4 py-5 text-[15px] font-medium transition-colors ${
                  isActive
                    ? "text-primary-60"
                    : "text-gray-70 hover:text-primary-60"
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary-60 rounded-t-sm" />
                )}
              </Link>
            );
          })}
          <Link
            href="/contact"
            className="ml-4 bg-primary-60 hover:bg-primary-70 text-white px-5 py-2 rounded-md text-[14px] font-semibold transition-colors"
          >
            무료상담
          </Link>
        </nav>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-gray-70"
          aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-10 shadow-lg">
          <div className="max-w-[1200px] mx-auto px-6 py-3 flex flex-col">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`px-2 py-3 text-[15px] font-medium border-b border-gray-10 last:border-0 ${
                    isActive ? "text-primary-60" : "text-gray-70"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="mt-3 mb-2 bg-primary-60 hover:bg-primary-70 text-white px-5 py-3 rounded-md text-[14px] font-semibold text-center transition-colors"
            >
              무료상담
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
