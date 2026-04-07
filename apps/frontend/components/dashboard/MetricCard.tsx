import {cn} from "@/lib/utils";

export function MetricCard({
                               title,
                               value,
                               subtitle,
    className,
                           }: {
    title: string;
    value: number;
    subtitle?: string;
    className?: string;
}) {
    return (
        <div
            className={cn("min-h-[140px] rounded-2xl border border-white/10 bg-muted/50 backdrop-blur-xl p-5 hover:bg-white/[0.05] transition-200", className)}>
            <p className="text-sm text-white/60">{title}</p>
            <h2 className="text-2xl font-semibold mt-2">{value}</h2>
            {subtitle && (
                <p className="text-xs text-white/40 mt-1">{subtitle}</p>
            )}
        </div>
    );
}