import { Skeleton } from '@/components/ui/skeleton';

export function ExecutionLoadingSkeleton() {
  return (
    <div className="flex h-full flex-col gap-4 p-4">
      {/* Header Skeleton */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded-lg bg-white/5" />
          <div className="flex-1">
            <Skeleton className="h-4 w-24 bg-white/5" />
            <Skeleton className="mt-2 h-3 w-16 bg-white/5" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full bg-white/5" />
        </div>
        <div className="mt-4 flex gap-6">
          <Skeleton className="h-3 w-20 bg-white/5" />
          <Skeleton className="h-3 w-20 bg-white/5" />
        </div>
      </div>

      {/* Timeline Skeleton */}
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Skeleton className="h-3.5 w-3.5 rounded-full bg-white/5" />
          <Skeleton className="h-3 w-16 bg-white/5" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3"
            >
              <Skeleton className="h-8 w-8 rounded-md bg-white/5" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-2 w-12 bg-white/5" />
                <Skeleton className="h-3 w-32 bg-white/5" />
              </div>
              <Skeleton className="h-3 w-12 bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}