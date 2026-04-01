"use client";

import { useDashboard } from "@/hooks/dashboard/useDashboard";
import { ExecutionChart } from "@/components/dashboard/ExecutionChart";
import { ExecutionFeed } from "@/components/dashboard/ExecutionFeed";
import { MetricCard } from "@/components/dashboard/MetricCard";

export default function DashboardPage() {
    const { metrics, executions, loading } = useDashboard();

    return (
        <div className="flex flex-col gap-6 p-6 bg-[#0a0a0a] text-white min-h-screen">

            {/* TOP GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard title="Total Runs" value={metrics?.total ?? 0} />
                <MetricCard title="Successful" value={metrics?.success ?? 0} />
                <MetricCard title="Failed" value={metrics?.failed ?? 0} />
            </div>

            {/* CHART SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ExecutionChart data={executions} />
                <MetricCard
                    title="Running"
                    value={metrics?.running ?? 0}
                    subtitle="Active executions"
                />
            </div>

            {/* BOTTOM FULL GRID */}
            <div className="min-h-[400px]">
                <ExecutionFeed executions={executions} loading={loading} />
            </div>
        </div>
    );
}

function BentoCard({ className = "" }: { className?: string }) {
    return (
        <div className={`
      relative group overflow-hidden
      bg-white/[0.01] 
      border border-white/[0.05] 
      backdrop-blur-3xl 
      rounded-2xl 
      transition-all duration-500
      hover:bg-white/[0.03]
      hover:border-white/[0.1]
      ${className}
    `}>
            {/* SUBTLE INNER GLOW */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />

            {/* PLACEHOLDER FOR CONTENT */}
            <div className="p-6 h-full w-full flex flex-col">
                {/* You can drop your activity/execution content here later */}
            </div>
        </div>
    )
}