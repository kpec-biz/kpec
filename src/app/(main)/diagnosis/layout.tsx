import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "자금 적격 진단 | 내 기업 맞춤 정책자금 확인",
  description:
    "업종·규모·자금용도 3단계 진단으로 신청 가능한 정책자금을 즉시 확인하세요. 기업정책자금센터 무료 자가진단 서비스.",
  alternates: { canonical: "https://jsbizfunding.kr/diagnosis" },
};

export default function DiagnosisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[{ name: "자금 적격 진단", href: "/diagnosis" }]}
      />
      {children}
    </>
  );
}
