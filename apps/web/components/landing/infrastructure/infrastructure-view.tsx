'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, Variants, Transition } from 'framer-motion'
import { Cloud, BrainCircuit, Database, MessageSquare, ShieldCheck, Activity } from 'lucide-react'

const INTEGRATIONS = [
    {
        id: 'cloud',
        title: 'Cloud Providers',
        icon: Cloud,
        description: 'Provides a unified abstraction layer for AWS, GCP, and Azure. It translates high-level infrastructure intent into native CloudFormation or Terraform primitives, managing lifecycle and regional state automatically.',
        metrics: ['Auto-scaling Policies', 'IAM Role Federation', 'Cross-Region Failover']
    },
    {
        id: 'ai',
        title: 'AI Systems',
        icon: BrainCircuit,
        description: 'Integrates LLMs and vector search as native execution nodes. Handles context window management, token budget estimation, and RAG-based retrieval pipelines with minimal latency overhead.',
        metrics: ['Inference Optimization', 'Vector Indexing', 'Context Window Tuning']
    },
    {
        id: 'data',
        title: 'Databases',
        icon: Database,
        description: 'Manages stateful persistence with integrated read/write splitting and transaction logging. Supports ACID-compliant operations across heterogeneous data sources for reliable system state.',
        metrics: ['SQL/NoSQL Clustering', 'Consistent Replication', 'Batch Operation Logic']
    },
    {
        id: 'messaging',
        title: 'Messaging',
        icon: MessageSquare,
        description: 'Enables decoupled asynchronous communication using event-driven architectures. Handles message durability, exponential backoff retries, and automated dead-letter queue routing for complex event flows.',
        metrics: ['Pub/Sub Topology', 'Eventual Consistency', 'Backpressure Handling']
    }
]

// Define transitions explicitly to fix TS1117 and Type mismatches
const cardTransition: Transition = { type: 'spring', stiffness: 80, damping: 20 }
const exitTransition: Transition = { duration: 0.3 }

const cardVariants: Variants = {
    hidden: (direction: number) => ({ opacity: 0, x: direction * 50 }),
    visible: {
        opacity: 1,
        x: 0,
        transition: cardTransition
    },
    exit: (direction: number) => ({
        opacity: 0,
        x: direction * -50,
        transition: exitTransition
    })
}

const listVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
}

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
}

export function InfrastructureView() {
    const [activeTab, setActiveTab] = useState(INTEGRATIONS[0])

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveTab((prev) => {
                const idx = INTEGRATIONS.findIndex((i) => i.id === prev.id)
                return INTEGRATIONS[(idx + 1) % INTEGRATIONS.length]
            })
        }, 4500)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="w-full min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center pt-20 px-6 max-w-6xl mx-auto overflow-hidden">

            {/* Header */}
            <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-bold text-silver-gradient mb-3">
                    Integration Architecture
                </h1>
                <p className="text-neutral-400 text-sm md:text-base max-w-lg mx-auto">
                    The Runtime Kernel treats infrastructure as composable, deterministic execution nodes.
                </p>
            </div>

            <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 w-full">

                {/* Left: Capability Card */}
                <AnimatePresence mode="wait" custom={-1}>
                    <motion.div
                        key={`left-${activeTab.id}`}
                        custom={-1}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="w-full md:w-96 md:h-76 p-8 rounded-3xl border border-white/10 bg-neutral-900/50 backdrop-blur-md flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-white/5 rounded-xl">
                                    <activeTab.icon className="text-white" size={28} />
                                </div>
                                <h2 className="text-2xl font-bold text-white">{activeTab.title}</h2>
                            </div>
                            <p className="text-neutral-400 text-sm leading-relaxed">
                                {activeTab.description}
                            </p>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Center: Simplified Flow Diagram */}
                <div className="hidden md:flex relative w-45 h-45 items-center justify-center shrink-0">
                    <div className="absolute inset-0 rounded-full border border-white/10 animate-spin-slow" />
                    <div className="w-20 h-20 rounded-full bg-neutral-950 flex items-center justify-center border border-white/5 shadow-2xl">
                        <Activity className="text-purple-500 animate-pulse" size={24} />
                    </div>
                    {/* Decorative nodes */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0"
                    >
                        <div className="absolute top-0 left-1/2 w-3 h-3 bg-white/30 rounded-full -translate-x-1/2" />
                        <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-white/30 rounded-full -translate-x-1/2" />
                    </motion.div>
                </div>

                {/* Right: Metrics Card */}
                <AnimatePresence mode="wait" custom={1}>
                    <motion.div
                        key={`right-${activeTab.id}`}
                        custom={1}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="w-full md:w-96 md:h-76 p-8 rounded-3xl border border-white/5 bg-black/20 flex flex-col"
                    >
                        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-6">Runtime Properties</h3>
                        <motion.div
                            variants={listVariants}
                            initial="hidden"
                            animate="visible"
                            className="flex flex-col gap-3"
                        >
                            {activeTab.metrics.map(m => (
                                <motion.div
                                    key={m}
                                    variants={itemVariants}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5"
                                >
                                    <ShieldCheck size={16} className="text-emerald-500/50" />
                                    <span className="text-sm text-neutral-300 font-mono">{m}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                </AnimatePresence>

            </div>
        </div>
    )
}