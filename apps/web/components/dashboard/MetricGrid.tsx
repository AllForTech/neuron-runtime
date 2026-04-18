import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Activity, CheckCircle2, AlertCircle } from 'lucide-react';

export function MetricGrid({ metrics }: { metrics: any }) {
    const items = [
        { label: "Throughput", value: metrics?.total ?? 0, icon: Activity, trend: "+12%", color: "text-white" },
        { label: "Success Rate", value: `${((metrics?.success / metrics?.total) * 100 || 0).toFixed(1)}%`, icon: CheckCircle2, trend: "+0.2%", color: "text-emerald-500" },
        { label: "Exceptions", value: metrics?.failed ?? 0, icon: AlertCircle, trend: "-4%", color: "text-red-500" }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item, i) => (
                <motion.div
                    key={item.label}
                    whileHover={{ y: -2 }}
                    className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#0A0A0A] p-5 transition-all hover:border-white/10"
                >
                    <div className="flex items-start justify-between">
                        <div className="rounded-lg bg-white/5 p-2 text-neutral-400 group-hover:text-white transition-colors">
                            <item.icon size={18} />
                        </div>
                        <div className={`flex items-center gap-1 text-[10px] font-bold ${item.trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                            {item.trend}
                            {item.trend.startsWith('+') ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-2xl font-light tracking-tight">{item.value}</h3>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 mt-1">{item.label}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}