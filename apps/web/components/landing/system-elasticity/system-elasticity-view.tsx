'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GitCommit, Cpu, CheckCircle2, Zap, RefreshCw } from 'lucide-react'

// Initial state for dynamic logs
const INITIAL_LOGS = [
    { id: 1, event: 'Scaled Replica Count', status: 'success', time: '12:04:02' },
    { id: 2, event: 'Reconciled State', status: 'success', time: '12:03:45' },
    { id: 3, event: 'Optimization Policy', status: 'pending', time: '12:03:10' },
]

export function SystemElasticityView() {
    const [load, setLoad] = useState(45)
    const [logs, setLogs] = useState(INITIAL_LOGS)
    const [isReconciling, setIsReconciling] = useState(false)

    // Simulate passive real-time metrics
    useEffect(() => {
        if (isReconciling) return // Pause passive simulation during manual override

        const interval = setInterval(() => {
            setLoad(prev => Math.min(Math.max(prev + (Math.random() * 8 - 4), 20), 85))
        }, 2500)
        return () => clearInterval(interval)
    }, [isReconciling])

    // Interactive Force Reconciliation
    const handleForceReconcile = () => {
        if (isReconciling) return

        setIsReconciling(true)
        setLoad(95) // Spike load to simulate work

        setTimeout(() => {
            setLoad(45) // Return to baseline
            setIsReconciling(false)

            const newLog = {
                id: Date.now(),
                event: 'Manual Override Sync',
                status: 'success',
                time: new Date().toLocaleTimeString('en-US', { hour12: false }),
            }
            // Keep only the latest 3 logs to prevent overflow
            setLogs(prev => [newLog, ...prev].slice(0, 3))
        }, 1500)
    }

    return (
        // Locked height to viewport, pt-24 clears the floating navbar
        <div className="w-full h-screen pt-20 pb-6 px-4 md:px-6 flex flex-col items-center justify-center max-w-5xl mx-auto overflow-hidden">

            {/* Centered Header */}
            <header className="text-center mb-6 md:mb-10 shrink-0">
                <h1 className="text-2xl md:text-4xl font-bold text-silver-gradient mb-2 tracking-tight">Runtime Elasticity</h1>
                <p className="text-neutral-500 text-xs md:text-sm max-w-2xl mx-auto">
                    Self-healing control loops and continuous state reconciliation metrics. The system autonomously monitors adaptive thresholds in real-time, dynamically aligning physical execution with the deterministic desired configuration without manual intervention.
                </p>
            </header>

            {/* Main Dashboard - Stacks tightly on mobile, spreads on desktop  */}
            <div className="flex w-full flex-col md:flex-row gap-4 md:gap-6 min-h-0 items-center justify-center">

                {/* Left: State Alignment */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="w-full md:w-1/3 flex flex-col rounded-2xl border border-white/10 bg-neutral-900/40 p-4 md:p-6 backdrop-blur-md cursor-default"
                >
                    <h2 className="text-xs font-semibold text-white/40 mb-4 uppercase tracking-wider">State Alignment</h2>
                    <div className="space-y-3 md:space-y-4">
                        <StateIndicator label="Configuration" status="Synchronized" active={!isReconciling} />
                        <StateIndicator label="Orchestration" status={isReconciling ? "Syncing..." : "Converged"} active={!isReconciling} />
                        <StateIndicator label="Persistence" status="Consistency OK" active={true} />
                    </div>
                </motion.div>

                {/* Center: Adaptive Heuristics & Controls */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="w-full md:w-1/3 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-neutral-900/60 p-4 md:p-8 backdrop-blur-md shadow-xl cursor-default relative overflow-hidden"
                >
                    <h2 className="text-xs font-semibold text-white/40 mb-4 uppercase tracking-wider hidden md:block">Adaptive Thresholds</h2>

                    {/* Gauge - Hidden on very small screens to save vertical space */}
                    <div className="hidden sm:flex relative w-32 h-32 md:w-40 md:h-40 rounded-full items-center justify-center mb-4 md:mb-6">
                        <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-lg">
                            <circle cx="50%" cy="50%" r="42%" fill="none" stroke="currentColor" strokeWidth="6" className="text-white/5" />
                            <motion.circle
                                cx="50%" cy="50%" r="42%" fill="none" stroke={isReconciling ? "#3b82f6" : "#ffffff"} strokeWidth="6"
                                strokeDasharray="264" // Approximate circumference for 42% radius
                                animate={{
                                    strokeDashoffset: 264 - (264 * load) / 100,
                                    stroke: isReconciling ? "#3b82f6" : load > 80 ? "#ef4444" : "#ffffff"
                                }}
                                transition={{ type: "spring", stiffness: 60, damping: 15 }}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute text-center flex flex-col items-center">
                            <motion.span className="text-2xl md:text-3xl font-bold text-white tabular-nums">
                                {Math.round(load)}%
                            </motion.span>
                            <p className="text-[10px] text-neutral-500 uppercase font-mono tracking-widest mt-1">Load</p>
                        </div>
                    </div>

                    {/* Interactive Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleForceReconcile}
                        disabled={isReconciling}
                        className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wide transition-colors border ${
                            isReconciling
                                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                                : 'bg-white text-black border-white hover:bg-neutral-200'
                        }`}
                    >
                        {isReconciling ? (
                            <><RefreshCw size={14} className="animate-spin" /> Reconciling...</>
                        ) : (
                            <><Zap size={14} /> Force Loop</>
                        )}
                    </motion.button>
                </motion.div>

                {/* Right: Reconciliation Log */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="w-full md:w-1/3 flex flex-col rounded-2xl border border-white/5 bg-black/20 p-4 md:p-6 cursor-default"
                >
                    <h2 className="text-xs font-semibold text-white/40 mb-4 uppercase tracking-wider">Event Log</h2>
                    <div className="flex flex-col gap-2">
                        <AnimatePresence mode="popLayout">
                            {logs.map((log) => (
                                <motion.div
                                    key={log.id}
                                    layout
                                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                                    className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/5"
                                >
                                    <div className="flex items-center gap-2.5 truncate pr-2">
                                        <GitCommit size={14} className="text-neutral-500 shrink-0" />
                                        <span className="text-xs text-neutral-300 truncate">{log.event}</span>
                                    </div>
                                    <div className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider shrink-0 ${
                                        log.status === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                    }`}>
                                        {log.time}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </motion.div>

            </div>
        </div>
    )
}

function StateIndicator({ label, status, active }: { label: string, status: string, active: boolean }) {
    return (
        <div className="flex items-center justify-between group">
            <span className="text-xs md:text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors">{label}</span>
            <div className="flex items-center gap-2">
                <span className="text-[10px] md:text-xs font-mono text-white/70">{status}</span>
                {active ? (
                    <CheckCircle2 size={14} className="text-white" />
                ) : (
                    <RefreshCw size={14} className="text-blue-400 animate-spin" />
                )}
            </div>
        </div>
    )
}