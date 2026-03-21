import Image from "next/image";
import Link from "next/link";

const news = [
  {
    image: "/images/banners/fund-diagnosis.png",
    title: "2026년 중소기업 정책자금 4조 4,313억원 공급 확정",
    source: "중소벤처기업부",
    date: "2026.01",
    href: "#",
  },
  {
    image: "/images/headers/services.png",
    title: "소상공인 정책자금 융자사업 신청 접수 시작",
    source: "소상공인진흥공단",
    date: "2026.01",
    href: "#",
  },
  {
    image: "/images/headers/cases.png",
    title: "AI 기업 정책자금 한도 100억 확대, AX 스프린트",
    source: "중소벤처기업부",
    date: "2026.01",
    href: "#",
  },
  {
    image: "/images/headers/process.png",
    title: "수출기업화 운전자금 한도 5억→10억 확대 시행",
    source: "중진공",
    date: "2026.02",
    href: "#",
  },
];

export default function GovNewsBanner() {
  return (
    <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[14px]">
      {news.map((item, i) => (
        <Link
          key={i}
          href={item.href}
          className="group flex flex-col bg-gray-0 border border-gray-10 rounded-lg overflow-hidden no-underline text-inherit transition-all duration-200 hover:border-primary-50 hover:shadow-[0_4px_12px_rgba(11,80,208,0.06)] hover:-translate-y-0.5"
        >
          <div className="w-full aspect-[4/3] overflow-hidden bg-gray-10">
            <Image
              src={item.image}
              alt={item.title}
              width={400}
              height={300}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="px-[14px] pt-3 pb-[14px]">
            <div className="text-[10px] font-bold text-point-50 mb-1">
              정부지원금 소식
            </div>
            <div
              className="text-[13px] font-semibold text-gray-90 leading-[1.4] mb-1.5 overflow-hidden"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {item.title}
            </div>
            <div className="text-[10px] text-gray-40">
              {item.source} · {item.date}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
