import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import LayoutShell from "@/components/LayoutShell";

export const metadata: Metadata = {
  title: "KPEC 기업정책자금센터 | 중소기업 정책자금 전문 컨설팅",
  description:
    "중소기업 정책자금 전문 컨설팅. 운전자금, 시설자금, 기업인증까지 경영현황 분석 기반 맞춤 자금 설계. 무료상담 010-2020-5312",
  keywords:
    "정책자금, 중소기업, 운전자금, 시설자금, 기업인증, 컨설팅, 정부지원금",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = headers();
  const isAdmin = headersList.get("x-is-admin") === "1";

  return (
    <html lang="ko">
      <body className="font-sans antialiased">
        <LayoutShell isAdmin={isAdmin}>{children}</LayoutShell>
      </body>
    </html>
  );
}
