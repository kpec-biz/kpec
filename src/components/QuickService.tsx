import Link from "next/link";

const cards = [
  {
    href: "/diagnosis",
    title: "자금적격 진단",
    desc: "업종·재무 기반 신청 가능 자금 확인",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
  },
  {
    href: "/services",
    title: "운전자금",
    desc: "인건비·원자재 등 연 2.5%",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    href: "/services",
    title: "시설자금",
    desc: "최대 60억, 10년 상환",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="16" />
        <line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
  },
  {
    href: "/services",
    title: "인증 컨설팅",
    desc: "벤처·이노비즈·ISO 취득",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
  },
];

export default function QuickService() {
  return (
    <div className="relative z-10 px-6 -mt-9">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="bg-white border border-gray-10 rounded-lg px-5 py-4 flex items-center gap-3 shadow-sm hover:-translate-y-0.5 hover:border-primary-50 hover:shadow-md transition-all duration-200 group"
          >
            <div className="w-10 h-10 bg-primary-5 rounded-md flex items-center justify-center text-primary-60 flex-shrink-0 group-hover:bg-primary-10 transition-colors">
              {card.icon}
            </div>
            <div>
              <div className="text-sm font-bold text-gray-90">{card.title}</div>
              <div className="text-[11px] text-gray-40 mt-0.5">{card.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
