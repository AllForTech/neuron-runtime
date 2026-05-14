'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfigSectionRenderer } from "./ConfigSectionRenderer";
import { Layers2, Zap, Settings, ChevronRight } from 'lucide-react';

export function NodeConfigRenderer({ schema, values, onChange }: any) {
    return (
        <div className="relative flex flex-col w-full min-h-full">
            {/* Background gradient mesh */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/[0.02] rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-white/[0.015] rounded-full blur-[100px] mix-blend-screen" />
            </div>
            
            {/* Header indicator */}
            <motion.div 
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative flex items-center gap-2 px-3 py-4 mb-2"
            >
                <div className="flex items-center gap-1.5">
                    <Layers2 size={12} className="text-neutral-500" />
                    <span className="text-[10px] font-bold tracking-widest text-neutral-600 uppercase">
                        Configuration
                    </span>
                </div>
                <div className="h-px flex-1 bg-white/[0.04]" />
                <span className="text-[9px] font-mono text-neutral-700">
                    {schema.sections.length} sections
                </span>
            </motion.div>

            {/* Main content with glass effect */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="relative flex flex-col gap-3 px-2 pb-8"
            >
                <AnimatePresence mode="popLayout">
                    {schema.sections.map((section: any, index: number) => (
                        <motion.div
                            key={`${section.id}-${index}`}
                            layout
                            initial={{ opacity: 0, y: 12, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ 
                                delay: index * 0.03,
                                type: "spring",
                                stiffness: 300,
                                damping: 30
                            }}
                            className="relative w-full group"
                        >
                            {/* Subtle gradient border on hover */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/[0.06] via-transparent to-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            
                            <ConfigSectionRenderer
                                section={section}
                                values={values}
                                onChange={onChange}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}