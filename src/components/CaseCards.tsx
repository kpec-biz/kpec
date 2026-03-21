// 성공사례 등록 전까지 빈 배열 → 섹션 숨김
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cases: any[] = [];
const _casesBackup = [
  {
    tags: [
      { label: "시설자금", style: "bg-primary-5 text-primary-60" },
      { label: "15억원", style: "bg-[#fef7ed] text-[#b45309]" },
      { label: "연 2.5%", style: "bg-[#f0fdf4] text-[#16a34a]" },
    ],
    title: "스마트팩토리 구축으로 생산성 35% 향상",
    company: "자동차부품 제조 · 경기도 화성시",
    desc: "수동 생산라인의 IoT 기반 스마트팩토리 전환을 위해 시설자금을 활용. MES 도입과 로봇 자동화 설비를 구축했습니다.",
    result: "성과: 불량률 50% 감소, 인건비 연 2억원 절감, 2년 차 매출 40% 성장",
  },
  {
    tags: [
      { label: "운전자금", style: "bg-primary-5 text-primary-60" },
      { label: "3억원", style: "bg-[#fef7ed] text-[#b45309]" },
      { label: "연 2.4%", style: "bg-[#f0fdf4] text-[#16a34a]" },
    ],
    title: "AI 비전검사 솔루션 출시 1년 만에 매출 12억",
    company: "AI 소프트웨어 · 서울시 강남구",
    desc: "혁신창업사업화자금으로 핵심 개발인력 채용 및 GPU 서버 인프라를 구축. 벤처인증까지 동시 지원했습니다.",
    result: "성과: 벤처인증 획득, 시리즈A 30억원 투자 유치 성공",
  },
  {
    tags: [
      { label: "운전+시설", style: "bg-primary-5 text-primary-60" },
      { label: "15억원", style: "bg-[#fef7ed] text-[#b45309]" },
      { label: "연 2.3%", style: "bg-[#f0fdf4] text-[#16a34a]" },
    ],
    title: "동남아 수출 시장 진출, 수출 비중 30% 달성",
    company: "건강식품 제조 · 충남 천안시",
    desc: "HACCP·ISO 22000 인증 취득과 수출용 생산라인 증설을 동시에 진행. 비수도권·ESG 우대금리를 적용받아 금리를 낮췄습니다.",
    result: "성과: 베트남·태국 수출 개시, 비수도권 우수기업 선정",
  },
  {
    tags: [
      { label: "소상공인 자금", style: "bg-primary-5 text-primary-60" },
      { label: "7천만원", style: "bg-[#fef7ed] text-[#b45309]" },
      { label: "연 2.96%", style: "bg-[#f0fdf4] text-[#16a34a]" },
    ],
    title: "카페 리뉴얼 후 월 매출 150% 증가",
    company: "카페·베이커리 · 부산시 해운대구",
    desc: "소상공인 경영안정자금으로 인테리어 리뉴얼과 키오스크·온라인 주문 시스템을 도입했습니다.",
    result: "성과: 온라인 주문 비중 40%, 2호점 오픈 계획 수립",
  },
];

export default function CaseCards() {
  if (cases.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[1200px] mx-auto">
      {cases.map((item, i) => (
        <div key={i} className="bg-gray-0 border border-gray-10 rounded-lg p-6">
          <div className="flex gap-1.5 mb-2.5">
            {item.tags.map(
              (tag: { label: string; style: string }, j: number) => (
                <span
                  key={j}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded ${tag.style}`}
                >
                  {tag.label}
                </span>
              ),
            )}
          </div>
          <h4 className="text-[15px] font-bold text-gray-90 mb-1">
            {item.title}
          </h4>
          <div className="text-xs text-gray-40 mb-2">{item.company}</div>
          <p className="text-[13px] text-gray-50 leading-[1.5]">{item.desc}</p>
          <div className="mt-2.5 px-[14px] py-2.5 bg-primary-5 rounded-md text-xs text-primary-60 font-semibold">
            {item.result}
          </div>
        </div>
      ))}
    </div>
  );
}
