'use client';

import { Area, AreaChart, CartesianGrid, XAxis, ResponsiveContainer } from 'recharts';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { Execution } from '@/types';
import { useMemo } from 'react';
import { format } from 'date-fns';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const chartConfig = {
    total: { label: 'Total Cycles', color: '#ffffff' },
    success: { label: 'Successful', color: '#10b981' },
    failed: { label: 'Exceptions', color: '#ef4444' },
} satisfies ChartConfig;

export function DashboardChart({ data }: { data: Execution[] }) {
    const chartData = useMemo(() => {
        const dailyStats: Record<string, { date: string; total: number; success: number; failed: number }> = {};

        const sortedData = [...data].sort(
            (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
        );

        sortedData.forEach((d) => {
            const dateKey = format(new Date(d.startedAt), 'MMM d');
            if (!dailyStats[dateKey]) {
                dailyStats[dateKey] = { date: dateKey, total: 0, success: 0, failed: 0 };
            }
            dailyStats[dateKey].total += 1;
            if (d.status === 'success') dailyStats[dateKey].success += 1;
            else if (d.status === 'failed') dailyStats[dateKey].failed += 1;
        });

        return Object.values(dailyStats);
    }, [data]);

    /** * Calculate dynamic width:
     * Each date "column" gets 80px of space to ensure labels never overlap.
     */
    const dynamicWidth = useMemo(() => {
        const minWidth = 800; // Base width for small data sets
        const calculatedWidth = chartData.length * 80;
        return Math.max(minWidth, calculatedWidth);
    }, [chartData]);

    return (
        <div className="flex w-full flex-col overflow-hidden rounded-3xl border border-white/[0.05] bg-[#0A0A0A] transition-all duration-500 hover:border-white/[0.1]">
            <div className="flex flex-col md:flex-row md:items-center justify-between p-6 pb-2 gap-4">
                <div>
                    <h3 className="text-[10px] font-bold tracking-[0.3em] text-neutral-500 uppercase">
                        Engine Throughput
                    </h3>
                    <p className="mt-1 text-xs text-neutral-400 font-light">
                        Timeline of process resolution and error frequency.
                    </p>
                </div>

                <div className="flex items-center gap-6">
                    <LegendItem color="bg-white" label="Total" />
                    <LegendItem color="bg-emerald-500" label="Success" />
                    <LegendItem color="bg-red-500" label="Failed" />
                </div>
            </div>

            {/* Scrollable Container */}
            <ScrollArea className="w-full whitespace-nowrap">
                <div style={{ width: `${dynamicWidth}px` }} className="h-[320px] pr-3">
                    <ChartContainer config={chartConfig} className="h-full w-full">
                        <AreaChart
                            data={chartData}
                            margin={{ left: 20, right: 20, top: 40, bottom: 20 }}
                        >
                            <defs>
                                <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.05} />
                                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid
                                vertical={false}
                                strokeDasharray="3 3"
                                stroke="#ffffff05"
                            />

                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={16}
                                stroke="#404040"
                                fontSize={10}
                                fontWeight={500}
                                interval={0}
                            />

                            <ChartTooltip
                                cursor={{ stroke: '#ffffff10', strokeWidth: 1 }}
                                content={
                                    <ChartTooltipContent
                                        indicator="dot"
                                        className="border-white/10 bg-black/90 backdrop-blur-xl"
                                    />
                                }
                            />

                            <Area
                                dataKey="total"
                                type="monotone"
                                fill="url(#fillTotal)"
                                stroke="#ffffff"
                                strokeWidth={1.5}
                                dot={{ r: 2, fill: '#000', stroke: '#fff', strokeWidth: 1 }}
                                activeDot={{ r: 4, strokeWidth: 0 }}
                            />

                            <Area
                                dataKey="success"
                                type="monotone"
                                fill="transparent"
                                stroke="#10b981"
                                strokeWidth={1.5}
                                dot={false}
                            />

                            <Area
                                dataKey="failed"
                                type="monotone"
                                fill="transparent"
                                stroke="#ef4444"
                                strokeWidth={1.5}
                                dot={false}
                            />
                        </AreaChart>
                    </ChartContainer>
                </div>
                <ScrollBar orientation="horizontal" className="bg-white/5" />
            </ScrollArea>
        </div>
    );
}

function LegendItem({ color, label }: { color: string; label: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`h-1 w-1 rounded-full ${color}`} />
            <span className="text-[9px] font-bold tracking-widest text-neutral-500 uppercase">
        {label}
      </span>
        </div>
    );
}