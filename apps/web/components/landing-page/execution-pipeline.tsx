"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, useReducedMotion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronRight, ArrowRight, Activity, Zap, ShieldCheck } from "lucide-react";

/**
 * NEURON EXECUTION PIPELINE v2.0
 * Transitioning from "Terminal" to "Obsidian Infrastructure"
 */
const PIPELINE_STEPS = [
    {
        id: 'ingestion',
        label: 'Protocol 01',
        title: 'Multi-Source Ingestion',
        description: 'Unified gateway for real-time streams from APIs, webhooks, and distributed queues.',
        icon: Activity,
    },
    {
        id: 'workflow',
        label: 'Protocol 02',
        title: 'Deterministic Logic',
        description: 'State-aware execution kernel applying AI-driven routing and business constraints.',
        icon: Zap,
    },
    {
        id: 'delivery',
        label: 'Protocol 03',
        title: 'Action Synchronizer',
        description: 'Atomic delivery across the ecosystem with guaranteed traceability and rollback.',
        icon: ShieldCheck,
    },
] as const;

const INTEGRATIONS = ['AWS', 'Kafka', 'Slack', 'Stripe', 'GitHub', 'PostgreSQL', 'OpenAI'];

function StepModule({
                        step,
                        isActive,
                        isLast,
                        index
                    }: {
    step: typeof PIPELINE_STEPS[number];
    isActive: boolean;
    isLast: boolean;
    index: number;
}) {
    const Icon = step.icon;

    return (
        <div className="relative flex gap-8">
            {/* Vertical Pipeline Connector */}
            <div className="flex flex-col items-center">
                <motion.div
                    animate={isActive ? {
                        borderColor: "rgba(255,255,255,0.4)",
                        backgroundColor: "rgba(255,255,255,1)"
                    } : {
                        borderColor: "rgba(255,255,255,0.1)",
                        backgroundColor: "rgba(255,255,255,0.02)"
                    }}
                    className={cn(
                        "z-10 flex h-14 w-14 items-center justify-center rounded-2xl border transition-all duration-700",
                        isActive ? "text-black shadow-[0_0_30px_rgba(255,255,255,0.2)]" : "text-muted-foreground"
                    )}
                >
                    <Icon className="h-6 w-6" />
                </motion.div>

                {!isLast && (
                    <div className="relative h-24 w-[2px] bg-white/5">
                        <AnimatePresence>
                            {isActive && (
                                <motion.div
                                    initial={{ top: 0, height: 0 }}
                                    animate={{ height: "100%" }}
                                    exit={{ top: "100%", height: 0 }}
                                    transition={{ duration: 1.5, ease: "easeInOut" }}
                                    className="absolute inset-0 w-full bg-gradient-to-b from-white to-transparent"
                                />
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Content Module */}
            <div className="flex-1 pb-12">
                <motion.div
                    animate={isActive ? { opacity: 1, x: 10 } : { opacity: 0.4, x: 0 }}
                    className="space-y-2 transition-all duration-700"
                >
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
            {step.label}
          </span>
                    <h4 className="text-xl font-bold tracking-tight text-foreground">
                        {step.title}
                    </h4>
                    <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                        {step.description}
                    </p>
                </motion.div>
            </div>
        </div>
    );
}

export function ExecutionPipelineSection() {
    const [activeStep, setActiveStep] = useState(0);
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { once: true, margin: "-100px" });

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % PIPELINE_STEPS.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section ref={containerRef} className="relative w-full px-6 py-24 md:px-12 lg:py-48 overflow-hidden">
            <div className="mx-auto max-w-7xl">
                <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-start">

                    {/* Left Column: Context */}
                    <div className="lg:sticky lg:top-32">
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={isInView ? { opacity: 1 } : {}}
                            className="text-[11px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60"
                        >
                            System Workflow
                        </motion.span>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.1 }}
                            className="mt-6 text-5xl font-bold tracking-tighter text-foreground md:text-7xl"
                        >
                            Execution <br />
                            <span className="text-muted-foreground/30">Pipeline.</span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={isInView ? { opacity: 1 } : {}}
                            transition={{ delay: 0.2 }}
                            className="mt-8 max-w-md text-lg leading-relaxed text-muted-foreground"
                        >
                            Neuron processes complex event chains through a tiered ingestion and synchronization layer, ensuring zero data loss.
                        </motion.p>

                        {/* Integration Tech Stack */}
                        <div className="mt-12 flex flex-wrap gap-2">
                            {INTEGRATIONS.map((name, i) => (
                                <motion.div
                                    key={name}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                                    transition={{ delay: 0.3 + (i * 0.05) }}
                                    className="rounded-full border border-white/5 bg-white/[0.02] px-4 py-1.5 text-[11px] font-medium text-muted-foreground/80 backdrop-blur-sm"
                                >
                                    {name}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: The Visual Pipeline */}
                    <div className="relative mt-10 lg:mt-0">
                        {/* Background Glow */}
                        <div className="absolute -left-10 top-0 h-full w-px bg-gradient-to-b from-transparent via-white/10 to-transparent opacity-20" />

                        <div className="space-y-0">
                            {PIPELINE_STEPS.map((step, index) => (
                                <StepModule
                                    key={step.id}
                                    step={step}
                                    index={index}
                                    isActive={activeStep === index}
                                    isLast={index === PIPELINE_STEPS.length - 1}
                                />
                            ))}
                        </div>

                        {/* Call to Action Trigger */}
                        <motion.button
                            whileHover={{ x: 5 }}
                            className="mt-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors hover:text-white/80"
                        >
                            Explore the Kernel <ArrowRight className="h-4 w-4" />
                        </motion.button>
                    </div>

                </div>
            </div>
        </section>
    );
}

export default function ExecutionPipeline() {
    return <ExecutionPipelineSection />;
}