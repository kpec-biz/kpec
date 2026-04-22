import PageHeader from "@/components/PageHeader";
import NoticeTabs from "@/components/NoticeTabs";
import InstaBannerGrid from "@/components/InstaBannerGrid";
import { fetchNotices } from "@/lib/notices";
import { noticeFaqs } from "@/data/faq";

const PAGE_SIZE = 20;

export default async function NoticePage() {
  const [noticeRes, newsRes, analysisRes] = await Promise.all([
    fetchNotices({ limit: PAGE_SIZE, exclude: ["뉴스", "분석"] }),
    fetchNotices({ limit: PAGE_SIZE, category: "뉴스" }),
    fetchNotices({ limit: PAGE_SIZE, category: "분석" }),
  ]);

  return (
    <>
      <PageHeader
        bgImage="/images/headers/notice.png"
        title="알림·자료"
        subtitle="정책자금 공고, 뉴스, 분석 리포트를 확인하세요"
      />

      {/* SEO/크롤러용 SSR 콘텐츠 요약 (첫 번째 스크린에 표시되지 않음) */}
      <section className="sr-only" aria-hidden="true">
        <h2>최신 정책자금 공고 목록</h2>
        <ul>
          {noticeRes.records.slice(0, 10).map((item) => (
            <li key={item.pblancId}>
              <a href={`/notice/${item.pblancId}`}>
                {item.title} — {item.publishDate}
              </a>
              <p>{item.summary}</p>
            </li>
          ))}
        </ul>
        <h2>정책자금 뉴스</h2>
        <ul>
          {newsRes.records.slice(0, 5).map((item) => (
            <li key={item.pblancId}>
              <a href={`/notice/${item.pblancId}`}>{item.title}</a>
              <p>{item.summary}</p>
            </li>
          ))}
        </ul>
        <h2>정책자금 분석</h2>
        <ul>
          {analysisRes.records.slice(0, 5).map((item) => (
            <li key={item.pblancId}>
              <a href={`/notice/${item.pblancId}`}>{item.title}</a>
              <p>{item.summary}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="py-12 bg-gray-5 min-h-[60vh]">
        <div className="max-w-[1200px] mx-auto px-6">
          <NoticeTabs
            initialNotices={noticeRes.records}
            initialNoticeOffset={noticeRes.offset}
            initialNews={newsRes.records}
            initialNewsOffset={newsRes.offset}
            initialAnalysis={analysisRes.records}
            initialAnalysisOffset={analysisRes.offset}
            faqs={noticeFaqs}
          />
        </div>
      </section>

      <InstaBannerGrid />
    </>
  );
}
