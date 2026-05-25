'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {useSceneRuntimeContext} from "@/hooks/landing/useSceneRuntime";

const TOTAL_SCENES = 4
const DOT_SIZE = 8
const DOT_SPACING = 40

interface ViewIndicatorProps {
    onSceneChange: (index: number) => void
}

export function ViewIndicator({ onSceneChange }: ViewIndicatorProps) {
    // Access the shared runtime state
    const { runtime } = useSceneRuntimeContext()
    const sceneIndex = runtime.current.index

    // Calculate the height of the progress fill based on current scene
    const fillHeight = (sceneIndex / (TOTAL_SCENES - 1)) * 100

    return (
        <div className="hidden md:flex fixed right-12 top-1/2 -translate-y-1/2 z-50 flex-col items-center">
            <div className="relative flex flex-col items-center" style={{ height: (TOTAL_SCENES - 1) * DOT_SPACING }}>

                {/* 1. The Track (Background Line) */}
                <div
                    className="absolute w-[1px] bg-white/10 rounded-full"
                    style={{ height: '100%', top: 0 }}
                />

                {/* 2. The Progress Fill (Active Line) */}
                <motion.div
                    className="absolute w-px bg-white/70 origin-top"
                    initial={{ height: 0 }}
                    animate={{ height: `${fillHeight}%` }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    style={{ top: 0 }}
                />

                {/* 3. The Interactive Dots */}
                <div className="relative h-full flex flex-col justify-between">
                    {Array.from({ length: TOTAL_SCENES }).map((_, i) => (
                        <div key={i} className="relative flex items-center justify-center">
                            <motion.button
                                onClick={() => onSceneChange(i)} // Use the passed prop
                                className="relative z-10 group cursor-pointer"
                                aria-label={`Maps to scene ${i + 1}`}
                            >
                                {/* Hit Area Expansion (Invisible) */}
                                <div className="absolute -inset-4" />

                                {/* Dot Visual */}
                                <motion.div
                                    initial={false}
                                    animate={{
                                        backgroundColor: sceneIndex === i ? '#ffffff' : 'rgba(255,255,255,0.3)',
                                        borderColor: sceneIndex === i ? '#ffffff' : 'rgba(255,255,255,0.3)',
                                        scale: sceneIndex === i ? 1.2 : 1,
                                    }}
                                    whileHover={{
                                        borderColor: 'rgba(255,255,255,0.8)',
                                        scale: 1.4
                                    }}
                                    className="rounded-full border backdrop-blur-lg transition-colors duration-300"
                                    style={{
                                        width: DOT_SIZE,
                                        height: DOT_SIZE,
                                    }}
                                />

                                {/* Active Glow Ring */}
                                {sceneIndex === i && (
                                    <motion.div
                                        layoutId="indicator-glow"
                                        className="absolute inset-0 rounded-full bg-white/20 blur-md"
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </motion.button>

                            {/* Numerical indicator */}
                            <motion.span
                                animate={{
                                    opacity: sceneIndex === i ? 0.4 : 0,
                                    x: sceneIndex === i ? -24 : -20
                                }}
                                className="absolute left-0 text-[10px] font-mono text-white pointer-events-none"
                            >
                                0{i + 1}
                            </motion.span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}