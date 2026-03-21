import Skeleton from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-5 border border-gray-100"
          >
            <div className="flex items-start gap-4">
              <Skeleton className="w-12 h-12" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-2 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
          <Skeleton className="h-5 w-24 mb-4" />
          <Skeleton className="h-[220px] w-full" />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-3">
          <Skeleton className="h-5 w-32 mb-4" />
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      </div>
    </div>
  );
}
