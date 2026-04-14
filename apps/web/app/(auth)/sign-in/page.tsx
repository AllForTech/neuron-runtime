'use client'; // Required for Framer Motion on a page level

import { motion } from 'framer-motion';
import { AuthForm } from '@/components/auth/AuthForm';

export default function SignInPage() {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-[#030303] p-6 md:p-10">
            {/* Cinematic Animated Background Elements */}
            <div className="absolute inset-0 z-0 overflow-hidden">

                {/* Deep, static base glow (to center the focus) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[900px] max-h-[900px] rounded-full bg-white/[0.015] blur-[150px] opacity-70" />

                {/* Animated Gradient 'Plasma' Blobs using Framer Motion */}

                {/* Top-Right Area (Subtle Indigo) */}
                <motion.div
                    className="absolute -top-[10%] -right-[10%] w-[50dvw] h-[50dvw] rounded-full bg-indigo-950/10 blur-[120px]"
                    animate={{
                        x: [0, 50, -30, 0],
                        y: [0, -40, 60, 0],
                        scale: [1, 1.1, 0.95, 1],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />

                {/* Bottom-Left Area (Subtle Neural Green/Emerald) */}
                <motion.div
                    className="absolute -bottom-[20%] -left-[10%] w-[60dvw] h-[60dvw] rounded-full bg-emerald-950/15 blur-[140px]"
                    animate={{
                        x: [0, -60, 40, 0],
                        y: [0, 70, -50, 0],
                        scale: [1, 0.9, 1.05, 1],
                    }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />

                {/* Center Accent (Very subtle pure white glow that shifts behind the form) */}
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30dvw] h-[30dvw] rounded-full bg-white/[0.03] blur-[100px]"
                    animate={{
                        opacity: [0.3, 1, 0.6, 0.3],
                        scale: [0.8, 1, 0.9, 0.8],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </div>

            <div className="relative z-10 flex w-full max-w-sm flex-col gap-6">
                {/* The AuthForm already contains the Neuron branding and Zap logo */}
                <AuthForm />
            </div>
        </div>
    );
}