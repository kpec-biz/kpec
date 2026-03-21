import { SkeletonPageHeader } from "@/components/Skeleton";
import Skeleton from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="animate-fade-in">
      <SkeletonPageHeader />
      <div className="max-w-[1200px] mx-auto px-6 py-14 space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl overflow-hidden">
            <Skeleton className="h-[300px] w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
