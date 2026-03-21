import { SkeletonPageHeader } from "@/components/Skeleton";
import Skeleton from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="animate-fade-in">
      <SkeletonPageHeader />
      <div className="max-w-[1200px] mx-auto px-6 py-14 space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start gap-6">
            <Skeleton className="w-12 h-12 shrink-0" rounded />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
