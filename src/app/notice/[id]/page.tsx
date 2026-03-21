import Link from "next/link";

const samplePost = {
  id: 1,
  tag: "정책자금",
  title: "2026년 중소기업 정책자금 융자계획 공고",
  date: "2025.12.23",
  views: 1842,
  author: "KPEC 정책자금팀",
  content: [
    {
      type: "h2",
      text: "2026년 정책자금 주요 변경사항",
    },
    {
      type: "p",
      text: "중소벤처기업부는 2025년 12월 23일 2026년도 중소기업 정책자금 융자계획을 공고하였습니다. 2026년 총 공급 규모는 4조 4,313억원으로 2025년 대비 소폭 확대되었습니다.",
    },
    {
      type: "info-box",
      text: "2026년 정책자금 총 공급규모: 4조 4,313억원 (융자 4조 643억원 + 이차보전 3,670억원)",
    },
    {
      type: "h2",
      text: "6대 주요 변경사항",
    },
    {
      type: "ul",
      items: [
        "AI 기업 우대 (AX 스프린트): 한도 60억 → 100억원, 금리 -0.1%p",
        "DX·ESG 우대: 디지털전환·탄소중립 기업 금리 인하 집중",
        "투융자 결합: 투자조건부 융자 도입으로 부채비율 개선 지원",
        "내수→수출 전환 지원: 운전자금 한도 5억 → 10억원 확대",
        "지역·신산업 가점: 지방 주력산업, 뿌리기술(SW 포함) 우대",
        "미래 유망기술 강화: AI, 로봇, 글로벌 진출 기업 대폭 혜택",
      ],
    },
    {
      type: "h3",
      text: "신청 일정",
    },
    {
      type: "p",
      text: "서울·지방 소재 기업은 2026년 1월 5~6일, 경기·인천 소재 기업은 1월 7~8일에 신청 접수를 시작합니다. 이후 매월 첫째 주 4일간 접수하며, 예산 소진 시까지 운영됩니다.",
    },
    {
      type: "warn-box",
      text: "신청 전 중소기업 확인서, 사업자등록증, 재무제표(최근 2년) 등 서류를 반드시 준비하시기 바랍니다.",
    },
    {
      type: "h3",
      text: "신청 방법",
    },
    {
      type: "p",
      text: "중진공 누리집(kosmes.or.kr) 또는 소진공 누리집(semas.or.kr)에서 온라인 신청·접수하실 수 있습니다. 서류 준비가 어려운 경우 KPEC 전문 컨설턴트의 도움을 받으시기 바랍니다.",
    },
  ],
  tags: ["정책자금", "중진공", "2026년", "운전자금", "시설자금"],
  prev: { id: null, title: null },
  next: { id: 2, title: "2026년 1분기 소상공인 정책자금 신청 일정 안내" },
};

const recentPosts = [
  {
    id: 2,
    title: "2026년 1분기 소상공인 정책자금 신청 일정 안내",
    date: "2026.01.02",
  },
  {
    id: 3,
    title: "AX 스프린트 우대트랙 선정 기업 추가 모집",
    date: "2026.01.15",
  },
  { id: 4, title: "비수도권 기업 정책자금 우대 확대 시행", date: "2026.02.01" },
];

export default function NoticeDetailPage({
  params: _params,
}: {
  params: { id: string };
}) {
  const post = samplePost;

  return (
    <>
      <div className="pt-16" />

      <section className="py-12 bg-gray-5">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid lg:grid-cols-[1fr_320px] gap-8">
            {/* 본문 */}
            <article className="bg-white rounded-xl border border-gray-10 overflow-hidden">
              <div className="p-8">
                {/* 카테고리 태그 */}
                <span className="inline-block bg-primary-5 text-primary-60 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                  {post.tag}
                </span>

                {/* 제목 */}
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-90 mb-4 leading-tight">
                  {post.title}
                </h1>

                {/* 메타 */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-50 pb-6 border-b border-gray-10 mb-8">
                  <span>작성일: {post.date}</span>
                  <span>조회: {post.views.toLocaleString()}</span>
                  <span>작성자: {post.author}</span>
                </div>

                {/* 본문 렌더링 */}
                <div className="prose-content space-y-5">
                  {post.content.map((block, i) => {
                    if (block.type === "h2") {
                      return (
                        <h2
                          key={i}
                          className="text-xl font-bold text-gray-90 mt-8 mb-3"
                        >
                          {block.text}
                        </h2>
                      );
                    }
                    if (block.type === "h3") {
                      return (
                        <h3
                          key={i}
                          className="text-lg font-semibold text-gray-80 mt-6 mb-2"
                        >
                          {block.text}
                        </h3>
                      );
                    }
                    if (block.type === "p") {
                      return (
                        <p key={i} className="text-gray-70 leading-relaxed">
                          {block.text}
                        </p>
                      );
                    }
                    if (block.type === "ul" && block.items) {
                      return (
                        <ul key={i} className="space-y-2">
                          {block.items.map((item, j) => (
                            <li
                              key={j}
                              className="flex items-start gap-2 text-gray-70"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-primary-40 mt-2 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    if (block.type === "info-box") {
                      return (
                        <div
                          key={i}
                          className="bg-primary-5 border-l-4 border-primary-40 rounded-r-lg px-5 py-4 text-primary-70 text-sm font-medium"
                        >
                          {block.text}
                        </div>
                      );
                    }
                    if (block.type === "warn-box") {
                      return (
                        <div
                          key={i}
                          className="bg-point-50/10 border-l-4 border-point-50 rounded-r-lg px-5 py-4 text-point-60 text-sm font-medium"
                        >
                          {block.text}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>

                {/* 해시태그 */}
                <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-gray-10">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-5 text-gray-60 text-sm px-3 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* 공유 버튼 */}
                <div className="flex gap-2 mt-4">
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-20 rounded-lg text-sm text-gray-60 hover:border-primary-40 hover:text-primary-60 transition-colors">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                    공유하기
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-20 rounded-lg text-sm text-gray-60 hover:border-primary-40 hover:text-primary-60 transition-colors">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    링크 복사
                  </button>
                </div>
              </div>

              {/* 이전/다음 글 */}
              <div className="border-t border-gray-10">
                {post.next.id && (
                  <Link
                    href={`/notice/${post.next.id}`}
                    className="flex items-center gap-3 px-8 py-4 hover:bg-gray-5 transition-colors border-b border-gray-10"
                  >
                    <span className="text-xs font-semibold text-gray-40 w-12">
                      다음글
                    </span>
                    <span className="text-sm text-gray-70 flex-1">
                      {post.next.title}
                    </span>
                    <svg
                      className="w-4 h-4 text-gray-40"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                )}
                {post.prev.id && (
                  <Link
                    href={`/notice/${post.prev.id}`}
                    className="flex items-center gap-3 px-8 py-4 hover:bg-gray-5 transition-colors"
                  >
                    <span className="text-xs font-semibold text-gray-40 w-12">
                      이전글
                    </span>
                    <span className="text-sm text-gray-70 flex-1">
                      {post.prev.title}
                    </span>
                    <svg
                      className="w-4 h-4 text-gray-40"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </Link>
                )}
              </div>

              {/* 목록으로 */}
              <div className="p-6 text-center border-t border-gray-10">
                <Link
                  href="/notice"
                  className="inline-flex items-center gap-2 text-sm text-gray-60 hover:text-primary-60 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                  목록으로
                </Link>
              </div>
            </article>

            {/* 사이드바 */}
            <aside className="space-y-6">
              {/* 정책비교 영상 */}
              <div className="bg-white rounded-xl border border-gray-10 overflow-hidden">
                <Link href="/contact" className="block group relative">
                  <video
                    className="w-full aspect-video object-cover"
                    src="/videos/policy-compare.mp4"
                    muted
                    playsInline
                    loop
                    autoPlay
                  />
                  <div className="absolute inset-0 bg-primary-80/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-white text-primary-60 font-semibold px-4 py-2 rounded-full text-sm">
                      무료상담 신청
                    </span>
                  </div>
                </Link>
                <div className="p-4">
                  <p className="text-sm font-semibold text-gray-80 mb-1">
                    정책자금 한 번에 비교하기
                  </p>
                  <p className="text-xs text-gray-50">
                    클릭하면 무료상담 페이지로 이동합니다
                  </p>
                </div>
              </div>

              {/* 상담 CTA */}
              <div className="bg-primary-80 rounded-xl p-6 text-center">
                <p className="text-white font-bold mb-2">전문가 무료 상담</p>
                <p className="text-white/70 text-sm mb-4">
                  내 기업에 맞는 정책자금을 찾아드립니다
                </p>
                <Link
                  href="/contact"
                  className="block w-full bg-white text-primary-60 font-semibold py-2.5 rounded-lg hover:bg-gray-5 transition-colors text-sm"
                >
                  무료상담 신청
                </Link>
                <a
                  href="tel:010-2020-5312"
                  className="block w-full mt-2 border border-white/30 text-white font-semibold py-2.5 rounded-lg hover:bg-white/10 transition-colors text-sm"
                >
                  전화상담
                </a>
              </div>

              {/* 최근 공고 */}
              <div className="bg-white rounded-xl border border-gray-10 p-5">
                <h3 className="font-bold text-gray-80 mb-4">최근 공고</h3>
                <ul className="space-y-3">
                  {recentPosts.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/notice/${p.id}`}
                        className="flex flex-col gap-0.5 hover:text-primary-60 transition-colors"
                      >
                        <span className="text-sm text-gray-70 hover:text-primary-60 line-clamp-2 leading-snug">
                          {p.title}
                        </span>
                        <span className="text-xs text-gray-40">{p.date}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 관련 서비스 */}
              <div className="bg-white rounded-xl border border-gray-10 p-5">
                <h3 className="font-bold text-gray-80 mb-4">관련 서비스</h3>
                <div className="space-y-2">
                  {[
                    { label: "운전자금", href: "/services" },
                    { label: "시설자금", href: "/services" },
                    { label: "기업인증 컨설팅", href: "/services" },
                    { label: "자금적격 진단", href: "/diagnosis" },
                  ].map((s) => (
                    <Link
                      key={s.label}
                      href={s.href}
                      className="flex items-center justify-between py-2 border-b border-gray-10 last:border-0 text-sm text-gray-70 hover:text-primary-60 transition-colors"
                    >
                      {s.label}
                      <svg
                        className="w-4 h-4 text-gray-30"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
