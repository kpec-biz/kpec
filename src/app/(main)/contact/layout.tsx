import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "무료상담 신청 | 기업정책자금센터",
  description:
    "전문 컨설턴트가 기업 맞춤형 정책자금을 무료로 안내합니다. 후불 성공보수제. 010-2466-4800",
  alternates: { canonical: "https://jsbizfunding.kr/contact" },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "무료상담 신청", href: "/contact" }]} />
      {children}
    </>
  );
}
