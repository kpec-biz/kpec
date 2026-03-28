import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "알림·자료 | 정책자금 공고·뉴스·분석",
  description:
    "최신 정책자금 공고, 뉴스 큐레이션, 심층 분석 리포트. 매일 업데이트. 기업정책자금센터에서 엄선한 정보를 확인하세요.",
  alternates: { canonical: "https://jsbizfunding.kr/notice" },
};

export default function NoticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "알림·자료", href: "/notice" }]} />
      {children}
    </>
  );
}
