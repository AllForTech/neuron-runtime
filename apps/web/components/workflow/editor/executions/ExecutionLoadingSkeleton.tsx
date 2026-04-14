import { Skeleton } from '@/components/ui/skeleton';

export function ExecutionLoadingSkeleton() {
  return (
    <div className="animate-in fade-in flex h-full w-full! flex-col space-y-8 p-4 duration-500">
      {/* Header Skeleton */}
      <div className="rounded-3xl border border-white/5 bg-neutral-900/40 p-5 backdrop-blur-xl">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-8 w-20 rounded-full bg-white/5" />
          <Skeleton className="h-6 w-24 rounded-full bg-white/5" />
        </div>

        <div className="mb-8 space-y-3">
          <Skeleton className="h-8 w-64 rounded-lg bg-white/5" />
          <Skeleton className="h-3 w-48 rounded-md bg-white/5" />
        </div>

        {/* Ribbon Stats Skeleton */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="space-y-3 rounded-2xl border border-white/5 bg-neutral-950/40 p-3.5"
            >
              <Skeleton className="h-2.5 w-16 bg-white/5" />
              <Skeleton className="h-3 w-24 bg-white/10" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[1fr,1.3fr] items-start gap-6">
        {/* Timeline Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Skeleton className="h-3 w-3 rounded-full bg-white/5" />
            <Skeleton className="h-3 w-24 bg-white/5" />
          </div>
          <div className="space-y-3 rounded-3xl border border-white/5 bg-neutral-900/20 p-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-xl border border-transparent bg-white/[0.02] p-4"
              >
                <Skeleton className="h-10 w-10 rounded-lg bg-white/5" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-2 w-12 bg-white/5" />
                  <Skeleton className="h-3 w-32 bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inspector Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Skeleton className="h-3 w-3 rounded-full bg-white/5" />
            <Skeleton className="h-3 w-24 bg-white/5" />
          </div>
          <div className="h-[500px] space-y-6 rounded-3xl border border-white/5 bg-neutral-900/40 p-6">
            <div className="flex gap-4 border-b border-white/5 pb-4">
              <Skeleton className="h-4 w-16 rounded-md bg-white/10" />
              <Skeleton className="h-4 w-16 rounded-md bg-white/5" />
            </div>
            <Skeleton className="h-full w-full rounded-2xl bg-white/[0.02]" />
          </div>
        </div>
      </div>
    </div>
  );
}
