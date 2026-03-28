import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "정책자금 안내 | 운전자금·시설자금·기업인증",
  description:
    "중소기업 운전자금 연 2.5%, 시설자금 최대 60억, 벤처·이노비즈·메인비즈 인증 컨설팅. 기업정책자금센터가 맞춤 자금을 설계합니다.",
  alternates: { canonical: "https://jsbizfunding.kr/services" },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[{ name: "정책자금 안내", href: "/services" }]}
      />
      {children}
    </>
  );
}
