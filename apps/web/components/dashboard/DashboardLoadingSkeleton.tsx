'use client';

import { motion } from 'framer-motion';

export default function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-[#050505] p-4 lg:p-8 font-sans text-white">
            {/* 1. Header Skeleton */}
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                <div className="space-y-2">
                    <div className="h-7 w-48 rounded-md bg-white/5 animate-pulse" />
                    <div className="h-4 w-64 rounded-md bg-white/[0.02] animate-pulse" />
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-6 w-6 rounded-full border-2 border-black bg-white/5 animate-pulse" />
                        ))}
                    </div>
                    <div className="h-4 w-24 rounded-md bg-white/5 animate-pulse" />
                </div>
            </header>

            {/* 2. Metric Ribbon Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 rounded-2xl border border-white/5 bg-[#0A0A0A] p-5 space-y-4">
                        <div className="flex justify-between">
                            <div className="h-8 w-8 rounded-lg bg-white/5 animate-pulse" />
                            <div className="h-4 w-12 rounded-md bg-white/5 animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-8 w-20 rounded-md bg-white/10 animate-pulse" />
                            <div className="h-3 w-24 rounded-md bg-white/5 animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>

            {/* 3. Main Workspace Skeleton */}
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">

                {/* Chart Area */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="h-[400px] rounded-3xl border border-white/5 bg-[#0A0A0A] flex flex-col p-6 space-y-6">
                        <div className="flex justify-between">
                            <div className="space-y-2">
                                <div className="h-4 w-32 rounded bg-white/10 animate-pulse" />
                                <div className="h-3 w-48 rounded bg-white/5 animate-pulse" />
                            </div>
                            <div className="flex gap-4">
                                <div className="h-3 w-12 rounded bg-white/5 animate-pulse" />
                                <div className="h-3 w-12 rounded bg-white/5 animate-pulse" />
                            </div>
                        </div>
                        <div className="flex-1 w-full bg-white/[0.02] rounded-xl animate-pulse" />
                    </div>

                    {/* Bottom Grid Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="h-48 rounded-2xl border border-white/5 bg-[#0A0A0A] p-6 space-y-4">
                            <div className="h-3 w-24 rounded bg-white/10 animate-pulse" />
                            <div className="space-y-3">
                                <div className="h-2 w-full rounded bg-white/5 animate-pulse" />
                                <div className="h-2 w-full rounded bg-white/5 animate-pulse" />
                                <div className="h-2 w-full rounded bg-white/5 animate-pulse" />
                            </div>
                        </div>
                        <div className="h-48 rounded-2xl border border-white/5 bg-[#0A0A0A] p-6 flex flex-col justify-between">
                            <div className="h-8 w-8 rounded-lg bg-white/10 animate-pulse" />
                            <div className="space-y-2">
                                <div className="h-10 w-24 rounded bg-white/10 animate-pulse" />
                                <div className="h-3 w-32 rounded bg-white/5 animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Feed Skeleton */}
                <aside className="lg:col-span-4">
                    <div className="h-[740px] rounded-3xl border border-white/5 bg-[#0A0A0A] overflow-hidden p-5 flex flex-col gap-6">
                        <div className="h-4 w-32 rounded bg-white/10 animate-pulse" />
                        <div className="space-y-4 overflow-hidden">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.03] bg-white/[0.01]">
                                    <div className="h-10 w-10 rounded-lg bg-white/5 animate-pulse" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 w-3/4 rounded bg-white/5 animate-pulse" />
                                        <div className="h-2 w-1/2 rounded bg-white/5 animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}