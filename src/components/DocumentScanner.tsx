"use client";

// animation_mockup.html — Document Scanner 로딩 애니메이션
export default function DocumentScanner({
  text = "서류를 확인하고 있습니다...",
}: {
  text?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative w-[120px] h-[160px]">
        {/* 문서 */}
        <div className="w-full h-full border-2 border-gray-20 rounded-lg bg-white relative overflow-hidden">
          {/* 스캐너 라인들 */}
          <div className="absolute top-6 left-4 right-4 flex flex-col gap-2">
            {[80, 60, 90, 50, 75, 40].map((w, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full animate-shimmer bg-gradient-to-r from-gray-10 via-primary-5 to-gray-10 bg-[length:200%_100%]"
                style={{
                  width: `${w}%`,
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: "2s",
                }}
              />
            ))}
          </div>
          {/* 스캔 빔 */}
          <div
            className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-primary-50 to-transparent animate-scan-beam"
            style={{
              boxShadow: "0 0 12px rgba(11, 80, 208, 0.4)",
            }}
          />
          {/* 체크 뱃지 */}
          <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-primary-60 flex items-center justify-center">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
            >
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
        </div>
      </div>
      <p className="mt-5 text-sm font-semibold text-gray-50 animate-pulse">
        {text}
      </p>
    </div>
  );
}
