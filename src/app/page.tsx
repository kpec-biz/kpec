import HeroVideo from "@/components/HeroVideo";
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

export default function Home() {
  return (
    <>
      {/* 히어로 - 풀너비, 사이드바 없음 */}
      <HeroVideo />

      {/* 본문 + 사이드바 영역 */}
      <div className="max-w-[1200px] mx-auto px-6 relative">
        <QuickService />
        <FundDiagnosis />
        <ServiceCards />
        <GovBanner />
        <Stats />
        <GovNewsBanner />
        <NoticeBoard />
        <CaseCards />
        <ProcessSteps />
        <CtaSection />

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
