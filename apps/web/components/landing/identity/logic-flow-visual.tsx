'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Zap, Globe, Database, Mail, Terminal } from 'lucide-react'

const NODES = [
    { id: 'n1', x: 10, y: 50, icon: Zap },      // Trigger
    { id: 'n2', x: 45, y: 25, icon: Globe },    // HTTP
    { id: 'n3', x: 45, y: 70, icon: Database }, // Process
    { id: 'n4', x: 85, y: 52, icon: Mail },     // Output 1
    { id: 'n5', x: 85, y: 88, icon: Terminal }, // Output 2
]

const CONNECTIONS = [
    { from: 'n1', to: 'n2' },
    { from: 'n1', to: 'n3' },
    { from: 'n3', to: 'n4' },
    { from: 'n3', to: 'n5' },
]

const getCurvyPath = (x1: number, y1: number, x2: number, y2: number) => {
    const cx1 = x1 + (x2 - x1) / 2
    const cy1 = y1
    const cx2 = x1 + (x2 - x1) / 2
    const cy2 = y2
    return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`
}

export function LogicFlowVisual() {
    return (
        <div className="relative w-full h-full min-h-[450px] flex items-center justify-center p-8">
            <svg
                viewBox="0 0 100 100"
                className="w-full h-full max-w-3xl overflow-visible"
                fill="none"
                preserveAspectRatio="xMidYMid meet"
            >
                {/* Connection Lines */}
                {CONNECTIONS.map((conn, i) => {
                    const fromNode = NODES.find((n) => n.id === conn.from)!
                    const toNode = NODES.find((n) => n.id === conn.to)!
                    const path = getCurvyPath(fromNode.x, fromNode.y, toNode.x, toNode.y)

                    return (
                        <g key={`line-${i}`}>
                            <path
                                d={path}
                                stroke="white"
                                strokeWidth="0.2"
                                strokeOpacity="0.1"
                                strokeLinecap="round"
                            />
                            <motion.path
                                d={path}
                                stroke="white"
                                strokeWidth="0.4"
                                strokeOpacity="0.4"
                                strokeLinecap="round"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{
                                    pathLength: [0, 1, 1, 0],
                                    opacity: [0, 1, 1, 0],
                                    pathOffset: [0, 0, 1, 1],
                                }}
                                transition={{
                                    duration: 6,
                                    repeat: Infinity,
                                    delay: i * 1.5,
                                    ease: "easeInOut",
                                }}
                            />
                        </g>
                    )
                })}

                {/* Nodes scaled to 8x8 units for a sharper look */}
                {NODES.map((node) => (
                    <foreignObject
                        key={node.id}
                        x={node.x - 7} // Centering 8x8 node on coordinate
                        y={node.y - 7}
                        width="14"
                        height="14"
                        className="overflow-visible"
                    >
                        <NodeIcon icon={node.icon} delay={Math.random() * 2} />
                    </foreignObject>
                ))}
            </svg>
        </div>
    )
}

function NodeIcon({ icon: Icon, delay }: { icon: any; delay: number }) {
    return (
        <motion.div
            whileHover={{ scale: 1.1, borderColor: "rgba(255,255,255,0.4)" }}
            // rounded-[2px] ensures a square with minimal rounding
            // p-1.5 adds inner padding for the icon
            className="w-full h-full flex items-center justify-center rounded-[2.5px] bg-[#0A0A0A] border-[0.01px]! border-white/10 relative group cursor-crosshair p-[1.5px]"
        >
            {/* Background Subtle Pulse */}
            <motion.div
                animate={{
                    opacity: [0, 0.05, 0],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: delay
                }}
                className="absolute inset-0 bg-white"
            />

            {/* Centered Icon with scaling to fit padding */}
            <div className="relative z-10 w-full h-full flex items-center justify-center p-[21.5%]">
                <Icon className="w-full h-full text-white/90 group-hover:text-white transition-all duration-300" strokeWidth={1.5} />
            </div>
        </motion.div>
    )
}