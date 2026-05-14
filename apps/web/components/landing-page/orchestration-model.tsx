"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    Radio, Binary, GitBranch, Share2, Send, Activity,
    ChevronLeft, ChevronRight
} from "lucide-react";

const STAGE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    radio: Radio,
    binary: Binary,
    "git-branch": GitBranch,
    "share-2": Share2,
    send: Send,
    activity: Activity,
};

const DATA = {
    badge: 'Orchestration Model',
    heading: 'Coordinated Flow.',
    concepts: [
        { title: 'Deterministic', description: 'Explicit transition paths.' },
        { title: 'Synchronized', description: 'State continuity across nodes.' },
        { title: 'Procedural', description: 'Decision-based routing.' },
        { title: 'Observable', description: 'Full telemetry streaming.' },
    ],
    stages: [
        { id: '01', title: 'Ingestion', icon: 'radio', desc: 'Capture inbound signals from APIs and webhooks.' },
        { id: '02', title: 'Resolution', icon: 'binary', desc: 'Evaluate routing conditions and dependencies.' },
        { id: '03', title: 'Coordination', icon: 'git-branch', desc: 'Synchronize operations across services.' },
        { id: '04', title: 'Propagation', icon: 'share-2', desc: 'Transfer state across distributed boundaries.' },
        { id: '05', title: 'Delivery', icon: 'send', desc: 'Dispatch atomic actions to target integrations.' },
        { id: '06', title: 'Monitoring', icon: 'activity', desc: 'Collect diagnostics and sync visibility.' },
    ]
};

export function OrchestrationModel() {
    const [active, setActive] = useState(0);
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { once: true, margin: "-100px" });

    // Handle Infinite Loop indexing
    const getIndex = (index: number) => {
        const len = DATA.stages.length;
        return (index + len) % len;
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setActive((prev) => getIndex(prev + 1));
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section ref={containerRef} className="relative flex w-full flex-col items-center px-6 py-24 md:py-40 overflow-hidden">
            {/* 1. Header Section */}
            <div className="mb-20 flex max-w-4xl flex-col items-center text-center">
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    className="text-[11px] font-bold uppercase tracking-[0.5em] text-white/30"
                >
                    {DATA.badge}
                </motion.span>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.1 }}
                    className="mt-6 text-5xl font-bold tracking-tighter text-white md:text-7xl lg:text-8xl"
                >
                    {DATA.heading.split(' ')[0]} <span className="text-white/20">{DATA.heading.split(' ')[1]}</span>
                </motion.h2>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ delay: 0.2 }}
                    className="mt-12 grid grid-cols-2 gap-x-12 gap-y-6 md:grid-cols-4"
                >
                    {DATA.concepts.map((c) => (
                        <div key={c.title} className="flex flex-col items-center">
                            <span className="text-xs font-bold text-white/80">{c.title}</span>
                            <span className="mt-1 text-[10px] uppercase tracking-wider text-white/20">{c.description}</span>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* 2. 3D Infinite Carousel Visual */}
            <div className="relative flex h-[450px] w-full items-center justify-center">
                {/* The Connection Line behind cards */}
                <div className="absolute top-1/2 left-0 right-0 z-0 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                <div className="relative h-full w-full max-w-5xl">
                    {DATA.stages.map((stage, idx) => {
                        // Calculate relative position from active index
                        let offset = idx - active;
                        const len = DATA.stages.length;

                        // Adjust offset for infinite feel
                        if (offset > len / 2) offset -= len;
                        if (offset < -len / 2) offset += len;

                        const isActive = idx === active;
                        const absOffset = Math.abs(offset);

                        // 3D calculation logic
                        const xTranslation = offset * 220; // Distance between cards
                        const scale = isActive ? 1 : 1 - absOffset * 0.15;
                        const zIndex = 10 - absOffset;
                        const opacity = isActive ? 1 : 0.4 - absOffset * 0.1;
                        const blur = isActive ? 0 : absOffset * 4;

                        const Icon = STAGE_ICONS[stage.icon] || Radio;

                        return (
                            <motion.div
                                key={stage.id}
                                initial={false}
                                animate={{
                                    x: `calc(-50% + ${xTranslation}px)`,
                                    scale,
                                    zIndex,
                                    opacity: absOffset > 2 ? 0 : opacity, // Only show center + 2 neighbors
                                    filter: `blur(${blur}px)`,
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 25,
                                }}
                                onClick={() => setActive(idx)}
                                className={cn(
                                    "absolute top-1/2 left-1/2 flex h-[340px] w-[260px] -translate-y-1/2 cursor-pointer flex-col items-center justify-center rounded-[2.5rem] border border-white/10 bg-white/[0.02] transition-colors duration-500 backdrop-blur-md",
                                    isActive ? "border-white/30 bg-white/[0.05]" : "hover:border-white/20"
                                )}
                            >
                                {/* Protocol ID */}
                                <div className="absolute top-8 text-[10px] font-bold tracking-[0.3em] text-white/20">
                                    {stage.id}
                                </div>

                                {/* Icon Container */}
                                <div className={cn(
                                    "flex h-16 w-16 items-center justify-center rounded-2xl border transition-all duration-700",
                                    isActive ? "border-white/40 bg-white text-black" : "border-white/10 bg-white/5 text-white/40"
                                )}>
                                    <Icon className="h-8 w-8" />
                                </div>

                                {/* Content */}
                                <div className="mt-8 text-center px-8">
                                    <h4 className={cn(
                                        "text-xl font-bold tracking-tight transition-colors duration-500",
                                        isActive ? "text-white" : "text-white/30"
                                    )}>
                                        {stage.title}
                                    </h4>

                                    <AnimatePresence>
                                        {isActive && (
                                            <motion.p
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="mt-4 text-xs leading-relaxed text-white/50"
                                            >
                                                {stage.desc}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Highlight Pulse for active */}
                                {isActive && (
                                    <motion.div
                                        layoutId="glow"
                                        className="absolute inset-0 rounded-[2.5rem] bg-white/[0.02] shadow-[inset_0_0_40px_rgba(255,255,255,0.05)]"
                                    />
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* 3. Navigation Controls */}
            <div className="mt-12 flex flex-col items-center gap-8">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => setActive(getIndex(active - 1))}
                        className="flex h-12 w-12 items-center justify-center rounded-full border border-white/5 bg-white/[0.02] text-white/40 transition-all hover:border-white/20 hover:text-white"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>

                    <div className="flex gap-3">
                        {DATA.stages.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setActive(i)}
                                className={cn(
                                    "h-1 rounded-full transition-all duration-500",
                                    active === i ? "w-10 bg-white" : "w-3 bg-white/10 hover:bg-white/20"
                                )}
                            />
                        ))}
                    </div>

                    <button
                        onClick={() => setActive(getIndex(active + 1))}
                        className="flex h-12 w-12 items-center justify-center rounded-full border border-white/5 bg-white/[0.02] text-white/40 transition-all hover:border-white/20 hover:text-white"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>
                </div>
            </div>

            {/* Final Background Ambience */}
            <div className="pointer-events-none absolute bottom-0 left-1/2 h-[600px] w-full -translate-x-1/2 bg-[radial-gradient(circle_at_50%_100%,_rgba(255,255,255,0.02)_0%,_transparent_70%)]" />
        </section>
    );
}