"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Box, FastForward, Shield } from "lucide-react";
import * as THREE from "three";

/**
 * NEURON HERO - MODERN PREMIUM EDITION
 * Focuses on sleekness, readability, and high-fidelity enterprise aesthetics.
 */

function ElegantShape() {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (meshRef.current) {
            meshRef.current.rotation.y = t * 0.15;
            meshRef.current.rotation.x = t * 0.1;
            meshRef.current.position.y = Math.sin(t * 0.5) * 0.2;
        }
    });

    return (
        <group>
            {/* Soft sophisticated lighting */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={2} color="#ffffff" />
            <directionalLight position={[-5, -5, -5]} intensity={0.5} color="#a1a1aa" />
            <spotLight position={[0, 10, 0]} intensity={1} angle={0.5} penumbra={1} color="#e4e4e7" />

            {/* Smooth abstract geometry (Premium "Software" feel) */}
            <mesh ref={meshRef}>
                <torusKnotGeometry args={[1.5, 0.5, 256, 64]} />
                <meshStandardMaterial
                    color="#f4f4f5"
                    roughness={0.3}
                    metalness={0.8}
                    emissive="#ffffff"
                    emissiveIntensity={0.05}
                />
            </mesh>

            {/* Subtle glow aura */}
            <mesh scale={2.5}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.02} />
            </mesh>
        </group>
    );
}

const FEATURES = [
    { icon: Box, label: "Visual Architecture" },
    { icon: FastForward, label: "Instant Deploy" },
    { icon: Shield, label: "Enterprise Grade" },
];

export default function Hero() {
    return (
        <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#0A0A0B] font-sans selection:bg-white/20">
            {/* 1. SOFT CSS BACKGROUND GRADIENTS */}
            {/* Top-center soft glow */}
            <div className="absolute -top-[20%] left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-white/[0.03] blur-[120px]" />
            {/* Bottom ambient glow */}
            <div className="absolute -bottom-[20%] left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-white/[0.02] blur-[100px]" />

            {/* 2. 3D BACKGROUND LAYER */}
            <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen md:opacity-60">
                <Canvas camera={{ position: [0, 0, 8], fov: 35 }}>
                    <ElegantShape />
                </Canvas>
            </div>

            {/* 3. FOREGROUND CONTENT */}
            <div className="container relative z-10 mx-auto px-6 py-20 text-center md:px-12">

                {/*/!* Modern Pill Badge *!/*/}
                {/*<motion.div*/}
                {/*    initial={{ opacity: 0, y: 20 }}*/}
                {/*    animate={{ opacity: 1, y: 0 }}*/}
                {/*    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}*/}
                {/*    className="mx-auto mb-8 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 backdrop-blur-md"*/}
                {/*>*/}
                {/*    <Sparkles className="h-3.5 w-3.5 text-white/70" />*/}
                {/*    <span className="text-xs font-medium tracking-wide text-white/80">*/}
                {/*        Neuron Engine 2.0 is now live*/}
                {/*    </span>*/}
                {/*</motion.div>*/}

                {/* Refined Typography (No aggressive strokes or terminal fonts) */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="mx-auto max-w-4xl text-5xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 sm:text-6xl md:text-7xl lg:text-8xl"
                >
                    Orchestrate backend logic, beautifully.
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg md:text-lg"
                >
                    A professional-grade visual engine for your infrastructure.
                    Connect APIs, databases, and microservices in a seamless canvas without touching a single configuration file.
                </motion.p>

                {/* Sleek Call to Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6"
                >
                    <button className="group flex h-12 items-center gap-2 rounded-full bg-white px-8 text-sm font-semibold text-zinc-950 transition-all hover:scale-105 hover:bg-zinc-100 active:scale-95 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
                        Start Building Free
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </button>

                    <button className="flex h-12 items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/50 px-8 text-sm font-medium text-zinc-300 backdrop-blur-md transition-all hover:border-zinc-700 hover:text-white">
                        Book a Demo
                    </button>
                </motion.div>

                {/* Elegant Feature Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="mx-auto mt-24 flex max-w-3xl flex-wrap justify-center gap-x-12 gap-y-6 border-t border-white/[0.05] pt-8"
                >
                    {FEATURES.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3 text-zinc-500 transition-colors hover:text-zinc-300">
                            <feature.icon className="h-4 w-4" />
                            <span className="text-sm font-medium">{feature.label}</span>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Subtle Vignette for depth */}
            <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
        </section>
    );
}