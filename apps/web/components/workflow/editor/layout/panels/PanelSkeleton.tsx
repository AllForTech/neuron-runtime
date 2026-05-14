'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PanelSkeletonProps {
    className?: string;
    position?: 'left' | 'right';
}

export function PanelSkeleton({ className, position = 'right' }: PanelSkeletonProps) {
    const width = position === 'left' ? 300 : 370;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
                'flex h-full w-full z-30 flex-col overflow-hidden bg-[#0A0A0A] p-4',
                className
            )}
            style={{ width }}
        >
            {/* Header Skeleton */}
            <div className="flex w-full items-center justify-between border-b border-white/[0.06] pb-3 shrink-0">
                <div className="flex items-center gap-2">
                    <SkeletonBlock className="w-3.5 h-3.5 rounded" />
                    <SkeletonBlock className="w-16 h-2.5 rounded" />
                </div>
                <SkeletonBlock className="w-6 h-6 rounded-lg" />
            </div>

            {/* Content Skeleton */}
            <div className="mt-4 w-full h-full flex flex-1 flex-col gap-3">
                {/* List items skeleton */}
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-2">
                        <SkeletonBlock className="w-full h-12 rounded-lg" />
                        {i % 2 === 0 && (
                            <div className="pl-2 flex flex-col gap-1.5">
                                <SkeletonBlock className="w-4/5 h-3 rounded" />
                                <SkeletonBlock className="w-3/5 h-3 rounded" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

function SkeletonBlock({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                'animate-pulse bg-gradient-to-br from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_200%]',
                className
            )}
            style={{
                backgroundImage: 'linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 50%, #2a2a2a 100%)',
            }}
        />
    );
}

export function PanelSkeletonLoader() {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="relative h-8 w-8">
                    <div className="absolute inset-0 animate-ping rounded-full bg-neutral-600 opacity-20" />
                    <div className="absolute inset-0 animate-pulse rounded-full border-2 border-neutral-600 border-t-transparent" />
                </div>
                <div className="flex items-center gap-1.5 text-neutral-500">
                    <SkeletonBlock className="w-12 h-3 rounded" />
                    <span className="animate-ellipsis">...</span>
                </div>
            </div>
        </div>
    );
}