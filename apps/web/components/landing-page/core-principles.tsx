"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Route, Shield, Eye, Layers, ArrowUpRight } from "lucide-react";

/**
 * NEURON CORE PRINCIPLES v2.0
 * Obsidian Design System alignment.
 */
const PILLAR_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    route: Route,
    shield: Shield,
    eye: Eye,
    layers: Layers,
};

const CORE_PRINCIPLES_SECTION = {
    id: 'core-principles',
    badge: 'Technical Foundations',
    heading: 'System Determinism',
    pillars: [
        {
            id: 'deterministic',
            title: 'Deterministic Execution',
            description: 'Guaranteed state consistency. Every event is processed with mathematical certainty, ensuring no side-effects.',
            icon: 'route',
        },
        {
            id: 'resilient',
            title: 'Resilient By Design',
            description: 'Native fault tolerance with automated circuit breaking and state recovery built into the kernel.',
            icon: 'shield',
        },
        {
            id: 'observable',
            title: 'Deep Observability',
            description: 'Real-time telemetry for every node. Trace the logic of every decision as it happens within the flow.',
            icon: 'eye',
        },
        {
            id: 'extensible',
            title: 'Open Architecture',
            description: 'The engine is middleware-agnostic. Integrate any service or protocol through our unified node interface.',
            icon: 'layers',
        },
    ],
} as const;

interface PillarCardProps {
    title: string;
    description: string;
    icon: string;
    index: number;
}

function PillarCard({ title, description, icon, index }: PillarCardProps) {
    const Icon = PILLAR_ICONS[icon] || Route;
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const shouldReduceMotion = useReducedMotion();

    return (
        <motion.div
            ref={ref}
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
                duration: 0.7,
                delay: shouldReduceMotion ? 0 : index * 0.1,
                ease: [0.16, 1, 0.3, 1], // Custom cubic-bezier for "snappy" entry
            }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/5 bg-card/20 p-8 transition-all duration-500 hover:border-white/20 hover:bg-white/[0.03]"
        >
            {/* Visual Decoration: Scanline Effect on Hover */}
            <div className="absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(255,255,255,0.03)_50%,transparent_100%)] h-[200%] w-full -translate-y-full animate-[scan_4s_linear_infinite]" />
            </div>

            <div className="relative z-10">
                <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-background text-muted-foreground transition-all duration-500 group-hover:border-white/40 group-hover:text-foreground">
                    <Icon className="h-6 w-6" />
                </div>

                <h3 className="text-lg font-bold tracking-tight text-foreground/90">
                    {title}
                </h3>

                <p className="mt-4 text-sm leading-relaxed text-muted-foreground/60 transition-colors duration-500 group-hover:text-muted-foreground">
                    {description}
                </p>
            </div>

            <div className="relative z-10 mt-10 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 transition-colors group-hover:text-white/60">
                Engine Protocol 0{index + 1}
                <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0" />
            </div>
        </motion.div>
    );
}

export function CorePrinciplesSection() {
    const { badge, heading, pillars } = CORE_PRINCIPLES_SECTION;
    const sectionRef = useRef<HTMLElement>(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

    return (
        <section
            ref={sectionRef}
            className="relative w-full px-6 py-24 md:px-12 md:py-32 lg:py-48 overflow-hidden"
        >
            {/* Background radial highlight */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />

            <div className="mx-auto max-w-7xl relative z-10">
                <div className="mb-20">
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={isInView ? { opacity: 1 } : {}}
                        className="text-[11px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60"
                    >
                        {badge}
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.1 }}
                        className="mt-6 text-5xl font-bold tracking-tighter text-foreground md:text-7xl"
                    >
                        {heading.split(' ')[0]} <br />
                        <span className="text-muted-foreground/30">{heading.split(' ')[1]}</span>
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {pillars.map((pillar, index) => (
                        <PillarCard
                            key={pillar.id}
                            title={pillar.title}
                            description={pillar.description}
                            icon={pillar.icon}
                            index={index}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

export default function CorePrinciples() {
    return <CorePrinciplesSection />;
}