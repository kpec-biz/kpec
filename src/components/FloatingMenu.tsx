"use client";

export default function FloatingMenu() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed right-3 sm:right-5 bottom-[72px] sm:bottom-5 flex flex-col gap-2 z-50">
      {/* 전화상담 */}
      <a
        href="tel:050268004681"
        className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 bg-primary-60 hover:bg-primary-50 text-white rounded-full shadow-lg transition-transform hover:scale-110"
        aria-label="전화상담"
      >
        <svg
          className="w-5 h-5"
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
      </a>

      {/* TOP */}
      <button
        onClick={scrollToTop}
        className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 bg-white border border-gray-10 text-gray-60 rounded-full shadow-lg transition-transform hover:scale-110"
        aria-label="맨 위로 이동"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 15l7-7 7 7"
          />
        </svg>
      </button>
    </div>
  );
}
