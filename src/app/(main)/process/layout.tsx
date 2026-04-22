import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "진행절차 | 8단계 정책자금 지원 프로세스",
  description:
    "무료상담부터 사후관리까지 8단계 정책자금 지원 프로세스. 서류 작성·심사 대응·실행까지 전 과정 원스톱 지원. 기업정책자금센터가 책임집니다.",
  alternates: { canonical: "https://jsbizfunding.kr/process" },
};

export default function ProcessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "진행절차", href: "/process" }]} />
      {children}
    </>
  );
}
