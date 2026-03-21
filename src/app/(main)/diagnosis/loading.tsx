import Skeleton from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="animate-fade-in max-w-[1200px] mx-auto px-6 py-20">
      <div className="text-center mb-10 space-y-3">
        <Skeleton className="h-6 w-32 mx-auto" />
        <Skeleton className="h-10 w-96 mx-auto" />
        <Skeleton className="h-4 w-72 mx-auto" />
      </div>
      <div className="max-w-[640px] mx-auto bg-white rounded-xl border border-gray-100 p-8 space-y-6">
        <Skeleton className="h-2 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-5 w-40" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        </div>
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}
