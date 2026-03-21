interface SkeletonProps {
  className?: string;
  rounded?: boolean;
}

export default function Skeleton({
  className = "",
  rounded = false,
}: SkeletonProps) {
  return (
    <div
      className={`animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] ${
        rounded ? "rounded-full" : "rounded-lg"
      } ${className}`}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div className="relative w-full h-[480px] md:h-[560px] bg-gray-200 animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="space-y-4 w-full max-w-[600px] px-6">
          <Skeleton className="h-8 w-1/3 mx-auto" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-6 w-2/3 mx-auto" />
          <div className="flex gap-3 justify-center pt-4">
            <Skeleton className="h-12 w-36" />
            <Skeleton className="h-12 w-36" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonPageHeader() {
  return (
    <div className="relative w-full h-[240px] md:h-[280px] bg-gray-200 animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  );
}
