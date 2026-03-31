import type { Metadata } from "next";
import HeroVideo from "@/components/HeroVideo";

export const metadata: Metadata = {
  title: "기업정책자금센터 | 중소기업 정책자금 맞춤 설계",
  description:
    "업종·재무 현황 분석 기반 정책자금 맞춤 설계. 운전자금·시설자금·기업인증 컨설팅. 후불 성공보수제, 승인 전 비용 0원. 무료상담 010-2466-4800",
  alternates: { canonical: "https://jsbizfunding.kr" },
};
import QuickService from "@/components/QuickService";
import FundDiagnosis from "@/components/FundDiagnosis";
import ServiceCards from "@/components/ServiceCards";
import GovBanner from "@/components/GovBanner";
import Stats from "@/components/Stats";
import GovNewsBanner from "@/components/GovNewsBanner";
import NoticeBoard from "@/components/NoticeBoard";
import CaseCards from "@/components/CaseCards";
import ProcessSteps from "@/components/ProcessSteps";
import CtaSection from "@/components/CtaSection";
import HomeSidebar from "@/components/HomeSidebar";
import ScrollReveal from "@/components/ScrollReveal";

export default function Home() {
  return (
    <>
      {/* 히어로 - 풀너비, 사이드바 없음 */}
      <HeroVideo />

      {/* 본문 + 사이드바 영역 */}
      <div className="max-w-[1200px] mx-auto px-6 relative">
        <ScrollReveal>
          <QuickService />
        </ScrollReveal>
        <ScrollReveal>
          <FundDiagnosis />
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <ServiceCards />
        </ScrollReveal>
        <ScrollReveal>
          <GovBanner />
        </ScrollReveal>
        <ScrollReveal>
          <Stats />
        </ScrollReveal>
        <ScrollReveal>
          <GovNewsBanner />
        </ScrollReveal>
        <ScrollReveal>
          <NoticeBoard />
        </ScrollReveal>
        <ScrollReveal>
          <CaseCards />
        </ScrollReveal>
        <ScrollReveal>
          <ProcessSteps />
        </ScrollReveal>
        <ScrollReveal>
          <CtaSection />
        </ScrollReveal>

        {/* 사이드바 - 본문 오른쪽 바깥, 퀵서비스 아래부터 시작 */}
        <aside className="hidden xl:block absolute top-[45px] left-[calc(100%+1px)] w-[280px]">
          <div className="sticky top-20">
            <HomeSidebar />
          </div>
        </aside>
      </div>
    </>
  );
}
