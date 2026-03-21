import { SkeletonHero } from "@/components/Skeleton";
import Skeleton from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="animate-fade-in">
      {/* Hero Skeleton */}
      <SkeletonHero />

      {/* Service Cards Skeleton */}
      <section className="py-14 px-6 bg-gray-5">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-9 space-y-3">
            <Skeleton className="h-6 w-24 mx-auto" />
            <Skeleton className="h-8 w-80 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden"
              >
                <Skeleton className="h-[180px] w-full rounded-none" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Skeleton */}
      <section className="py-14 px-6">
        <div className="max-w-[1200px] mx-auto space-y-6">
          <Skeleton className="h-8 w-64 mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </section>
    </div>
  );
}
