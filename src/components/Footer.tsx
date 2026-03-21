import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-primary-80">
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Logo & Info */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="flex items-center leading-none">
                <span className="text-[22px] font-black text-white">K</span>
                <span className="text-[22px] font-light text-white">PEC</span>
              </span>
              <span className="w-px h-5 bg-white/30" aria-hidden="true" />
              <span className="text-[20px] font-bold text-white">
                기업정책자금센터
              </span>
            </div>
            <div
              className="text-sm leading-relaxed space-y-1"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              <p>연락처: 010-2020-5312</p>
            </div>
          </div>

          {/* Service Links */}
          <div className="flex gap-12">
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">서비스</h4>
              <ul
                className="space-y-2 text-sm"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                <li>
                  <Link
                    href="/services"
                    className="hover:text-white transition-colors"
                  >
                    운전자금
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services"
                    className="hover:text-white transition-colors"
                  >
                    시설자금
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services"
                    className="hover:text-white transition-colors"
                  >
                    기업인증
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services"
                    className="hover:text-white transition-colors"
                  >
                    자금진단
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">
                바로가기
              </h4>
              <ul
                className="space-y-2 text-sm"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                {/* 성공사례 - 사례 등록 전까지 숨김 */}
                <li>
                  <Link
                    href="/process"
                    className="hover:text-white transition-colors"
                  >
                    진행절차
                  </Link>
                </li>
                <li>
                  <Link
                    href="/resources"
                    className="hover:text-white transition-colors"
                  >
                    알림·자료
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="hover:text-white transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="md:text-right">
            <p
              className="text-sm mb-3"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              지금 바로 전화 상담받으세요
            </p>
            <a
              href="tel:01020205312"
              className="inline-flex items-center gap-2 bg-primary-60 hover:bg-primary-50 text-white px-6 py-3 rounded-md font-semibold transition-colors text-sm"
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
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              전화상담
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          <div className="flex items-center gap-3">
            <Link href="/terms" className="hover:text-white transition-colors">
              이용약관
            </Link>
            <span>·</span>
            <Link
              href="/privacy"
              className="font-bold hover:text-white transition-colors text-white/80"
            >
              개인정보처리방침
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <span>© 2026 KPEC 기업정책자금센터</span>
            <span>·</span>
            <span>
              made by{" "}
              <a
                href="https://polarad.co.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors underline underline-offset-2"
              >
                pola
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
