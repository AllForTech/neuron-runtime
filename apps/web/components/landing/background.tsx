'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, useSpring } from 'framer-motion'
import Image from 'next/image'
import neuronBackground from "@/assets/neuron-background.png";
import {useSceneRuntimeContext} from "@/hooks/landing/useSceneRuntime";

export function RuntimeBackground() {
    const { runtime } = useSceneRuntimeContext()
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 })

    // Spring physics for smooth cursor following
    const springX = useSpring(50, { stiffness: 50, damping: 20 })
    const springY = useSpring(50, { stiffness: 50, damping: 20 })

    // Spring physics for the zoom/parallax effect
    const springScale = useSpring(1, { stiffness: 40, damping: 20 })

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Calculate percentage position for the radial gradient mask
            const xP = (e.clientX / window.innerWidth) * 100
            const yP = (e.clientY / window.innerHeight) * 100
            setMousePos({ x: xP, y: yP })
            springX.set(xP)
            springY.set(yP)
        }

        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [springX, springY])

    // Parallax Zoom Pattern: View 0 (1x) -> View 1 (1.15x) -> View 2 (1x) -> View 3 (1.1x)
    useEffect(() => {
        const scaleMap = [1, 1.2, 1, 1.25]
        springScale.set(scaleMap[runtime.current.index] || 1)
    }, [runtime, runtime.current.index, springScale])

    // Create the dynamic mask style for the cursor highlight
    const maskStyle = useMemo(() => ({
        WebkitMaskImage: `radial-gradient(circle 300px at ${mousePos.x}% ${mousePos.y}%, black 0%, transparent 100%)`,
        maskImage: `radial-gradient(circle 300px at ${mousePos.x}% ${mousePos.y}%, black 0%, transparent 100%)`,
    }), [mousePos])

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-background">
            {/* Layer 1: The Faint Base Background (Static/Global) */}
            <motion.div
                style={{ scale: springScale }}
                className="absolute inset-0 opacity-[0.12] grayscale transition-opacity duration-1000"
            >
                <Image
                    src={neuronBackground}
                    alt="System Mesh"
                    fill
                    priority
                    className="object-cover"
                />
            </motion.div>

            {/* Layer 2: The Cursor Highlight Layer */}
            <motion.div
                style={{
                    scale: springScale,
                    ...maskStyle
                }}
                className="absolute inset-0 opacity-[0.22] grayscale-0 transition-opacity duration-300"
            >
                <Image
                    src={neuronBackground}
                    alt="System Mesh Highlight"
                    fill
                    priority
                    className="object-cover"
                />
            </motion.div>

            {/* Optional: Subtle Noise Overlay for Texture */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    )
}