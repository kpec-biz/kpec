import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "성공사례 | 업종별 정책자금 승인 실적",
  description:
    "제조·IT·에너지·식품 등 다양한 업종의 정책자금 승인 사례. 평균 승인율 94%. 기업정책자금센터와 함께한 성공 스토리.",
  alternates: { canonical: "https://jsbizfunding.kr/cases" },
};

export default function CasesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "성공사례", href: "/cases" }]} />
      {children}
    </>
  );
}
