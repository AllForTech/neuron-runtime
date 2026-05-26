'use client';

import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-neutral-900", className)}
            {...props}
        />
    );
}


export function PanelSkeletonLoader() {

    return (
        <div
            className={cn(
                'flex h-full w-full! z-30 flex-col overflow-hidden bg-[#0A0A0A] p-4 border-l border-white/[0.04]',
            )}
        >
            {/* Header */}
            <div className="flex w-full items-center justify-between border-b border-white/[0.06] pb-4 shrink-0">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-3 w-24 rounded-full" />
                </div>
                <Skeleton className="h-8 w-8 rounded-xl" />
            </div>

            {/* Content Area */}
            <div className="mt-6 w-full h-full flex flex-1 flex-col gap-6 overflow-hidden">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-3">
                        {/* Section Label */}
                        <div className="flex items-center gap-2 mb-1">
                            <Skeleton className="h-3 w-3 rounded-sm opacity-50" />
                            <Skeleton className="h-2 w-16 rounded-full opacity-50" />
                        </div>

                        {/* Field Input Area */}
                        <Skeleton className="h-14 w-full rounded-2xl" />

                        {/* Detail Rows */}
                        {i % 2 === 0 && (
                            <div className="pl-4 flex flex-col gap-2 border-l border-white/[0.03]">
                                <Skeleton className="h-10 w-[85%] rounded-xl opacity-40" />
                                <Skeleton className="h-2.5 w-[60%] rounded-full opacity-30 ml-1" />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="mt-auto pt-4 border-t border-white/[0.04] flex items-center justify-between">
                <Skeleton className="h-2 w-12 rounded-full opacity-20" />
                <Skeleton className="h-2 w-8 rounded-full opacity-20" />
            </div>
        </div>
    );
}