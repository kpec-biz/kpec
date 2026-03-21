import { SkeletonPageHeader } from "@/components/Skeleton";
import Skeleton from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="animate-fade-in">
      <SkeletonPageHeader />
      <div className="max-w-[1200px] mx-auto px-6 py-14 space-y-4">
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-9 w-20" />
          ))}
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-100 p-4 flex gap-4"
          >
            <Skeleton className="h-20 w-28 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
