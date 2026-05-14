"use client";

import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    Database, MessageSquare, Bot, KeyRound,
    Cpu, Zap, Globe, Share2, Layers, Terminal
} from "lucide-react";

/**
 * NEURON CONNECTIVE CONFIG v2.0
 * Reflects the "Orchestration Kernel" positioning.
 */
const CATEGORIES = [
    {
        id: "storage",
        title: "State & Storage",
        icon: Database,
        color: "#ffffff",
        systems: ["PostgreSQL", "MongoDB", "Redis", "S3", "Pinecone"],
    },
    {
        id: "messaging",
        title: "Event Streaming",
        icon: MessageSquare,
        color: "#ffffff",
        systems: ["Kafka", "RabbitMQ", "Pub/Sub", "SQS", "NATS"],
    },
    {
        id: "ai",
        title: "Intelligence",
        icon: Bot,
        color: "#ffffff",
        systems: ["OpenAI", "Claude 3.5", "Llama 3", "HuggingFace"],
    },
    {
        id: "auth",
        title: "Identity Kernel",
        icon: KeyRound,
        color: "#ffffff",
        systems: ["Clerk", "Auth0", "Firebase", "Zitadel", "Keycloak"],
    },
] as const;

function NodeLine({ active }: { active: boolean }) {
    return (
        <svg className="absolute inset-0 h-full w-full pointer-events-none" preserveAspectRatio="none">
            <motion.path
                d="M 0 50 Q 50 50 100 50"
                stroke="currentColor"
                strokeWidth="1"
                fill="transparent"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={active ? { pathLength: 1, opacity: 0.2 } : { pathLength: 0, opacity: 0 }}
                transition={{ duration: 0.8, ease: "circOut" }}
            />
        </svg>
    );
}

function CategoryNode({
                          category,
                          isActive,
                          onClick
                      }: {
    category: typeof CATEGORIES[number];
    isActive: boolean;
    onClick: () => void;
}) {
    const Icon = category.icon;

    return (
        <motion.button
            onClick={onClick}
            className={cn(
                "group relative flex w-full items-center gap-4 rounded-2xl border p-5 transition-all duration-500",
                isActive
                    ? "border-white/20 bg-white/5 shadow-[0_0_30px_-10px_rgba(255,255,255,0.1)]"
                    : "border-border/40 bg-transparent hover:border-white/10 hover:bg-white/[0.02]"
            )}
        >
            <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl border transition-all duration-500",
                isActive ? "border-white/40 bg-white text-black" : "border-border bg-card text-muted-foreground"
            )}>
                <Icon className="h-6 w-6" />
            </div>

            <div className="flex flex-col items-start">
        <span className={cn(
            "text-sm font-bold tracking-tight transition-colors",
            isActive ? "text-foreground" : "text-muted-foreground"
        )}>
          {category.title}
        </span>
                <span className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/50">
          {isActive ? "Active Path" : "Standby"}
        </span>
            </div>

            {isActive && (
                <motion.div
                    layoutId="active-glow"
                    className="absolute inset-0 rounded-2xl bg-white/[0.03] blur-xl"
                />
            )}
        </motion.button>
    );
}

function OrchestrationHub({ activeId }: { activeId: string }) {
    const activeCategory = useMemo(() => CATEGORIES.find(c => c.id === activeId), [activeId]);

    return (
        <div className="relative center aspect-square w-full max-w-[500px]">
            {/* Background Radials */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.05)_0%,_transparent_70%)]" />

            {/* The "Neuron" Core */}
            <div className="relative z-10 center h-40 w-40 rounded-[32px] border border-white/20 bg-background shadow-2xl">
                <div className="absolute inset-0 animate-pulse rounded-[32px] bg-white/5 blur-2xl" />
                <Terminal className="h-10 w-10 text-white/80" />
                <div className="absolute -bottom-10 flex flex-col items-center">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Kernel Core</span>
                </div>
            </div>

            {/* Floating System Orbitals */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeId}
                    initial={{ opacity: 0, scale: 0.9, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 1.1, rotate: 10 }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                    className="absolute inset-0"
                >
                    {activeCategory?.systems.map((system, i) => {
                        const angle = (i / (activeCategory.systems.length)) * Math.PI * 2;
                        const x = Math.cos(angle) * 180;
                        const y = Math.sin(angle) * 180;

                        return (
                            <div
                                key={system}
                                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                                style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
                            >
                                <div className="rounded-full border border-white/10 bg-card/80 px-4 py-1.5 backdrop-blur-md shadow-xl">
                                    <span className="text-[11px] font-bold tracking-wide text-foreground/80">{system}</span>
                                </div>
                            </div>
                        );
                    })}
                </motion.div>
            </AnimatePresence>

            {/* SVG Connection Web */}
            <svg className="absolute inset-0 h-full w-full opacity-20" viewBox="0 0 500 500">
                <circle cx="250" cy="250" r="120" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" />
                <circle cx="250" cy="250" r="200" fill="none" stroke="white" strokeWidth="0.5" opacity="0.5" />
            </svg>
        </div>
    );
}

export default function ConnectiveIntelligence() {
    const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0].id);
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { once: true, margin: "-100px" });

    return (
        <section ref={containerRef} className="relative w-full overflow-hidden px-6 py-24 md:px-12 lg:py-40">
            <div className="mx-auto max-w-7xl">
                {/* Header Section */}
                <div className="mb-20 max-w-3xl">
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={isInView ? { opacity: 1 } : {}}
                        className="text-[11px] font-bold uppercase tracking-[0.4em] text-muted-foreground"
                    >
                        Connective Intelligence
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.1 }}
                        className="mt-6 text-5xl font-bold tracking-tighter text-foreground md:text-7xl"
                    >
                        Orchestrate <br /> <span className="text-muted-foreground/40">Complexity.</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={isInView ? { opacity: 1 } : {}}
                        transition={{ delay: 0.2 }}
                        className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground"
                    >
                        Neuron Engine treats third-party services as native nodes.
                        Connect your stack into a deterministic execution flow with ultra-low latency.
                    </motion.p>
                </div>

                {/* Interaction Grid */}
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
                    {/* Left: Category Selection */}
                    <div className="space-y-4 lg:col-span-4">
                        {CATEGORIES.map((cat) => (
                            <CategoryNode
                                key={cat.id}
                                category={cat}
                                isActive={activeCategory === cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                            />
                        ))}
                    </div>

                    {/* Right: Visual Orchestrator */}
                    <div className="center lg:col-span-8">
                        <OrchestrationHub activeId={activeCategory} />
                    </div>
                </div>
            </div>

            {/* Background Decorative Element */}
            <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-white/[0.02] blur-[120px]" />
        </section>
    );
}