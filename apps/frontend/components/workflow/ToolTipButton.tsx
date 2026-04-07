"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TooltipButtonProps {
    icon: LucideIcon;
    label: string;
    onClick: () => void;
    className?: string;
    side?: "left" | "right";
}

export function TooltipButton({
                                  icon: Icon,
                                  label,
                                  onClick,
                                  className,
                                  side = "right"
                              }: TooltipButtonProps) {
    return (
        <div className="group relative flex items-center justify-center">
            <button
                onClick={onClick}
                className={cn(
                    "flex items-center justify-center p-1 w-full h-8 rounded-xl transition-all duration-200",
                    "text-neutral-400 hover:text-white hover:bg-white/10 active:scale-90",
                    "border border-transparent hover:border-white/10",
                    className
                )}
            >
                <Icon size={18} strokeWidth={1.5} />
            </button>

            {/* Premium Tooltip Label */}
            <div
                className={cn(
                    "absolute hidden group-hover:block z-50 pointer-events-none transition-all duration-300",
                    "px-3 py-1.5 rounded-lg bg-neutral-900/90 backdrop-blur-md shadow-2xl border border-white/10",
                    "text-[10px] font-bold uppercase tracking-[0.15em] text-white whitespace-nowrap",
                    side === "right" ? "left-14" : "right-14"
                )}
            >
                {label}
            </div>
        </div>
    );
}