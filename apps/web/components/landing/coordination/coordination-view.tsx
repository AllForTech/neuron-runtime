'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
    Radio,
    Binary,
    GitBranch,
    Share2,
    Send,
    Activity,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'

const STAGE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    radio: Radio,
    binary: Binary,
    'git-branch': GitBranch,
    'share-2': Share2,
    send: Send,
    activity: Activity,
}

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
    ],
}

export function CoordinationView() {
    const [active, setActive] = useState(0)
    const containerRef = useRef(null)
    const isInView = useInView(containerRef, { once: true, margin: '-100px' })

    // Handle infinite loop indexing
    const getIndex = (index: number) => {
        const len = DATA.stages.length
        return (index + len) % len
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setActive((prev) => getIndex(prev + 1))
        }, 5000)
        return () => clearInterval(timer)
    }, [])

    return (
        <section ref={containerRef} className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-transparent px-4 pt-24! md:px-6 py-6">
            {/* Header Section - Compact for viewport fit */}
            <div className="mb-7 md:mb-10 flex flex-col items-center text-center max-w-3xl">

                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.1 }}
                    className="mt-3 md:mt-4 text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground"
                >
                    {DATA.heading.split(' ')[0]} <span className="text-foreground/20">{DATA.heading.split(' ')[1]}</span>
                </motion.h2>

                {/* Concepts Grid - Responsive */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ delay: 0.2 }}
                    className="mt-6 md:mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6"
                >
                    {DATA.concepts.map((c) => (
                        <div key={c.title} className="flex flex-col items-center">
                            <span className="text-xs md:text-sm font-bold text-foreground/80">{c.title}</span>
                            <span className="mt-1 text-[9px] md:text-[10px] uppercase tracking-wider text-foreground/20">{c.description}</span>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Carousel Section - Optimized height for viewport */}
            <div className="relative flex h-[290px] md:h-[320px] w-full items-center justify-center flex-1">
                {/* Connection line */}
                <div className="absolute top-1/2 left-0 right-0 z-0 h-px w-full bg-linear-to-r from-transparent via-foreground/5 to-transparent" />

                <div className="relative h-full w-full max-w-5xl">
                    {DATA.stages.map((stage, idx) => {
                        let offset = idx - active
                        const len = DATA.stages.length

                        if (offset > len / 2) offset -= len
                        if (offset < -len / 2) offset += len

                        const isActive = idx === active
                        const absOffset = Math.abs(offset)

                        // Scale for smaller viewport
                        const xTranslation = offset * 160
                        const scale = isActive ? 1 : 1 - absOffset * 0.15
                        const zIndex = 10 - absOffset
                        const opacity = isActive ? 1 : 0.5 - absOffset * 0.1
                        const blur = isActive ? 0 : absOffset * 3

                        const Icon = STAGE_ICONS[stage.icon] || Radio

                        return (
                            <motion.div
                                key={stage.id}
                                initial={false}
                                animate={{
                                    x: `calc(-50% + ${xTranslation}px)`,
                                    scale,
                                    zIndex,
                                    opacity: absOffset > 2 ? 0 : opacity,
                                    filter: `blur(${blur}px)`,
                                }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 200,
                                    damping: 25,
                                }}
                                onClick={() => setActive(idx)}
                                className={cn(
                                    'absolute top-1/2 left-1/2 flex flex-col items-center justify-center rounded-2xl md:rounded-3xl border transition-colors duration-500 cursor-pointer backdrop-blur-md',
                                    'h-[260px] w-[200px] md:h-[300px] md:w-[260px] -translate-y-1/2 px-4 md:px-0',
                                    isActive ? 'border-foreground/30 backdrop-blur-4xl! bg-foreground/8' : 'border-foreground/10 bg-foreground/2 hover:border-foreground/20'
                                )}
                            >
                                {/* Protocol ID */}
                                <div className="absolute top-4 md:top-6 text-[9px] md:text-[10px] font-bold tracking-[0.2em] md:tracking-[0.3em] text-foreground/20">
                                    {stage.id}
                                </div>

                                {/* Icon Container */}
                                <div
                                    className={cn(
                                        'flex items-center justify-center rounded-lg md:rounded-xl border transition-all duration-700',
                                        'h-12 w-12 md:h-16 md:w-16',
                                        isActive ? 'border-foreground/40 bg-foreground text-background' : 'border-foreground/10 bg-foreground/5 text-foreground/40'
                                    )}
                                >
                                    <Icon className="h-6 w-6 md:h-8 md:w-8" />
                                </div>

                                {/* Content */}
                                <div className="mt-4 md:mt-6 text-center px-4">
                                    <h4
                                        className={cn(
                                            'text-base md:text-lg font-bold tracking-tight transition-colors duration-500',
                                            isActive ? 'text-foreground' : 'text-foreground/30'
                                        )}
                                    >
                                        {stage.title}
                                    </h4>

                                    <AnimatePresence>
                                        {isActive && (
                                            <motion.p
                                                initial={{ opacity: 0, y: 3 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="mt-2 md:mt-3 text-[11px] md:text-xs leading-relaxed text-foreground/50"
                                            >
                                                {stage.desc}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Active highlight */}
                                {isActive && (
                                    <motion.div
                                        layoutId="glow"
                                        className="absolute inset-0 rounded-2xl md:rounded-3xl bg-foreground/1 shadow-[inset_0_0_30px_rgba(255,255,255,0.04)]"
                                    />
                                )}
                            </motion.div>
                        )
                    })}
                </div>
            </div>

            {/* Navigation Controls - Compact */}
            <div className="mt-6 md:mt-8 flex flex-col items-center gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setActive(getIndex(active - 1))}
                        className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full border border-foreground/5 bg-foreground/2 text-foreground/40 transition-all hover:border-foreground/20 hover:text-foreground"
                    >
                        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
                    </button>

                    <div className="flex gap-2 md:gap-3">
                        {DATA.stages.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setActive(i)}
                                className={cn(
                                    'h-0.5 md:h-1 rounded-full transition-all duration-500',
                                    active === i ? 'w-6 md:w-10 bg-foreground' : 'w-2 md:w-3 bg-foreground/10 hover:bg-foreground/20'
                                )}
                            />
                        ))}
                    </div>

                    <button
                        onClick={() => setActive(getIndex(active + 1))}
                        className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full border border-foreground/5 bg-foreground/[0.02] text-foreground/40 transition-all hover:border-foreground/20 hover:text-foreground"
                    >
                        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
                    </button>
                </div>
            </div>
        </section>
    )
}
