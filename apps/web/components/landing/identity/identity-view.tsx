'use client'

import React, { useState, useEffect } from 'react'
import { IdentityHeadline } from './identity-headline'
import { LogicFlowVisual } from './logic-flow-visual'

const HEADLINES = [
    { title: 'Distributed coordination', description: 'Synchronize operations across multiple systems and infrastructure domains seamlessly.' },
    { title: 'Stateful execution', description: 'Maintain persistent state throughout complex, multi-step workflows with full continuity.' },
    { title: 'Runtime continuity', description: 'Ensure uninterrupted operation even during failures and system transitions.' },
    { title: 'Infrastructure synchronization', description: 'Keep distributed services aligned and coordinated in real-time.' },
    { title: 'Observable systems', description: 'Gain complete visibility into every execution path and runtime decision.' },
    { title: 'Deterministic propagation', description: 'Predictable, verifiable operation across complex infrastructure landscapes.' },
]

export function IdentityView() {
    const [activeIndex, setActiveIndex] = useState(0)
    const [globeRotation, setGlobeRotation] = useState({ x: 0, y: 0, z: 0 })

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % HEADLINES.length)

            const rotations = [
                { x: Math.random() * 30, y: Math.random() * 90, z: 0 },
                { x: 0, y: Math.random() * 90, z: Math.random() * 30 },
                { x: Math.random() * 25, y: Math.random() * 100, z: Math.random() * 25 },
                { x: 0, y: Math.random() * 80, z: 0 },
            ]
            setGlobeRotation(rotations[Math.floor(Math.random() * rotations.length)])
        }, 3500)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="w-full min-h-screen flex flex-col lg:flex-row items-center justify-center px-6 md:px-12 py-12 pt-28 lg:pt-32 gap-12 lg:gap-20 overflow-hidden">

            {/* Left Region - Headline System */}
            <div className="w-full lg:w-1/2 lg:pl-10! flex pb-0 md:pb-10 lg:pb-20 flex-col justify-center items-center lg:items-start z-10">
                <IdentityHeadline
                    headlines={HEADLINES}
                    activeIndex={activeIndex}
                />
            </div>

            {/* Right Region - Spatial Visual */}
            {/* Changed `flex` to `hidden lg:flex` to remove the globe entirely on smaller screens */}
            <div className="hidden lg:flex w-full lg:w-1/2 items-center justify-center z-0">
                <LogicFlowVisual />
            </div>

        </div>
    )
}