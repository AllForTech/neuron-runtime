'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useDashboard } from '@/hooks/dashboard/useDashboard';
import { DashboardChart } from '@/components/dashboard/DashboardChart';
import { ExecutionFeed } from '@/components/dashboard/ExecutionFeed';
import { MetricGrid } from '@/components/dashboard/MetricGrid';
import { LogTimeline } from '@/components/workflow/editor/executions/LogsTimeline';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, ShieldCheck, Cpu, Globe, Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import DashboardSkeleton from "@/components/dashboard/DashboardLoadingSkeleton";

export default function Dashboard() {
    const { metrics, executions, loading, getExecutionLogs, isLogsLoading, logs, currentExecId } = useDashboard();

    const containerVars = {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
    };

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <motion.div
            variants={containerVars}
            initial="initial"
            animate="animate"
            className="min-h-screen bg-[#050505] p-4 lg:p-8 font-sans text-white"
        >
            {/* 1. Global Status Bar */}
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-xl font-medium tracking-tight">System Overview</h1>
                    <p className="text-sm text-neutral-500">Global engine performance and distribution telemetry.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-6 w-6 rounded-full border-2 border-black bg-neutral-800" />
                        ))}
                    </div>
                    <span className="text-[11px] font-medium text-neutral-400">3 Operators Active</span>
                    <div className="h-4 w-[1px] bg-white/10 mx-2" />
                    <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 border border-emerald-500/20">
                        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Engine Nominal</span>
                    </div>
                </div>
            </header>

            {/* 2. Intelligence Layer: Metric Ribbon */}
            <MetricGrid metrics={metrics} />

            {/* 3. Primary Workspace */}
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">

                {/* Main Analytics Block */}
                <div className="lg:col-span-8 space-y-6">
                    <section className="rounded-3xl border border-white/5 bg-[#0A0A0A] p-1 overflow-hidden">
                        <DashboardChart data={executions || []} />
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* System Distribution Card */}
                        <div className="rounded-2xl border border-white/5 bg-[#0A0A0A] p-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">Node Distribution</span>
                                <Globe size={14} className="text-neutral-600" />
                            </div>
                            <div className="space-y-3">
                                <DistributionBar label="North America" value={65} color="bg-primary" />
                                <DistributionBar label="Europe" value={22} color="bg-neutral-500" />
                                <DistributionBar label="Asia Pacific" value={13} color="bg-neutral-800" />
                            </div>
                        </div>

                        {/* Resources Popover Info */}
                        <div className="rounded-2xl border border-white/5 bg-[#0A0A0A] p-6 relative overflow-hidden group">
                            <div className="flex items-center justify-between">
                                <Cpu size={20} className="text-primary" />
                                <Popover>
                                    <PopoverTrigger><Info size={14} className="text-neutral-600 hover:text-white transition-colors" /></PopoverTrigger>
                                    <PopoverContent className="bg-neutral-900 border-white/10 text-xs text-neutral-400 w-64">
                                        Resource allocation is scaled dynamically based on concurrent workflow demands.
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="mt-4">
                                <span className="text-3xl font-light">2.4<span className="text-sm text-neutral-500 ml-1">vCPU</span></span>
                                <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-widest">Average Instance Load</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Rail: Activity Stream */}
                <aside className="lg:col-span-4 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase">Live Operations</h2>
                        <Activity size={12} className="text-primary animate-pulse" />
                    </div>

                    <div className="rounded-3xl border border-white/5 bg-[#0A0A0A] h-[700px] overflow-hidden flex flex-col">
                        <ExecutionFeed
                            executions={executions}
                            onClick={getExecutionLogs}
                            logs={Object.entries(logs || {}).length > 0}
                            currentExecId={currentExecId}
                            loading={loading}
                        />

                        <AnimatePresence>
                            {Object.entries(logs || {}).length > 0 && (
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: '50%' }}
                                    exit={{ height: 0 }}
                                    className="border-t border-white/10 bg-black/40 backdrop-blur-md"
                                >
                                    <ScrollArea className="h-full p-4">
                                        <LogTimeline logs={logs} title="Process Verbose" />
                                    </ScrollArea>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </aside>
            </div>
        </motion.div>
    );
}

function DistributionBar({ label, value, color }: { label: string, value: number, color: string }) {
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-medium">
                <span className="text-neutral-400">{label}</span>
                <span className="text-neutral-200">{value}%</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    className={`h-full ${color}`}
                />
            </div>
        </div>
    );
}