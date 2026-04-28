'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NodeConfigSchema } from "@neuron/shared";
import { ConfigSectionRenderer } from "./ConfigSectionRenderer";

interface NodeConfigRendererProps {
    schema: NodeConfigSchema;
    values: Record<string, any>;
    onChange: (path: string, value: any) => void;
}

export function NodeConfigRenderer({
                                       schema,
                                       values,
                                       onChange
                                   }: NodeConfigRendererProps) {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
            },
        },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-8 w-full max-w-full overflow-x-hidden pb-12"
        >
            <AnimatePresence mode="popLayout">
                {schema.sections.map((section, index) => (
                    <motion.div
                        key={section.id}
                        layout // Enables smooth layout transitions when things above/below change
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{
                            duration: 0.2,
                            ease: [0.23, 1, 0.32, 1] // Custom ease-out expo
                        }}
                    >
                        <ConfigSectionRenderer
                            section={section}
                            values={values}
                            onChange={onChange}
                        />

                        {/* Subtle Divider between sections, except for the last one */}
                        {index < schema.sections.length - 1 && (
                            <div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </motion.div>
    );
}