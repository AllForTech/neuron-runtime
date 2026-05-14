'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Settings, Zap, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";
import { getLayoutClass } from "./Layout";
import { ConfigFieldRenderer } from "./ConfigFieldRenderer";
import { DialogSectionRenderer } from "./sections/DialogSectionRenderer";

export function ConfigSectionRenderer({ section, values, onChange }: any) {
    const [isCollapsed, setIsCollapsed] = useState(section.defaultCollapsed ?? false);
    const isCollapsible = section.collapsible !== false;

    // Icon based on section type
    const getSectionIcon = () => {
        const id = section.id?.toLowerCase() || '';
        if (id.includes('meta') || id.includes('general')) return Settings;
        if (id.includes('execution') || id.includes('performance')) return Zap;
        return Settings;
    };
    
    const Icon = getSectionIcon();

    return (
       <>
           {section.layout === "dialog" ? (
               <DialogSectionRenderer
                   section={section}
                   values={values}
                   onChange={onChange}
               />
               ) : (
               <div className="relative flex flex-col w-full">
                   {/* Glass container */}
                   <div className={cn(
                       "relative rounded-2xl border border-white/[0.04] bg-white/[0.02] backdrop-blur-sm transition-all duration-300",
                       "hover:border-white/[0.08] hover:bg-white/[0.03]"
                   )}>
                       {/* Subtle inner glow */}
                       <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-neutral-950/30 pointer-events-none" />

                       {/* Header */}
                       <button
                           onClick={() => isCollapsible && setIsCollapsed(!isCollapsed)}
                           className={cn(
                               "relative flex items-center gap-3 w-full p-4 transition-all",
                               !isCollapsible && "pointer-events-none"
                           )}
                       >
                           {/* Icon badge */}
                           <div className={cn(
                               "flex items-center justify-center w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] transition-all duration-300",
                               isCollapsed ? "text-neutral-500" : "text-white shadow-[0_0_12px_-4px_rgba(255,255,255,0.15)]"
                           )}>
                               <Icon size={13} strokeWidth={1.5} />
                           </div>

                           {/* Title and description */}
                           <div className="flex flex-col items-start text-left flex-1">
                               <div className="flex items-center gap-2">
                                   <h3 className="text-[11px] font-semibold tracking-wide text-neutral-300">
                                       {section.title}
                                   </h3>
                                   {section.required && (
                                       <span className="text-[8px] font-bold text-red-400/60">REQUIRED</span>
                                   )}
                               </div>
                               {section.description && !isCollapsed && (
                                   <p className="text-[10px] text-neutral-600 mt-0.5 line-clamp-1">{section.description}</p>
                               )}
                           </div>

                           {/* Collapse indicator */}
                           {isCollapsible && (
                               <motion.div
                                   animate={{ rotate: isCollapsed ? 0 : 90 }}
                                   transition={{ duration: 0.2 }}
                                   className="flex items-center justify-center"
                               >
                                   <ChevronRight size={14} className="text-neutral-600" />
                               </motion.div>
                           )}

                           {/* Divider line */}
                           <div className="absolute bottom-0 left-4 right-4 h-px bg-white/[0.03]" />
                       </button>

                       {/* Content */}
                       <AnimatePresence>
                           {!isCollapsed && (
                               <motion.div
                                   initial={{ opacity: 0, height: 0 }}
                                   animate={{ opacity: 1, height: "auto" }}
                                   exit={{ opacity: 0, height: 0 }}
                                   transition={{ duration: 0.2 }}
                                   className="relative px-4 pb-5"
                               >
                                   <div className={cn(
                                       "grid gap-y-4",
                                       section.layout === "grid" && "grid-cols-2 gap-x-3",
                                       section.layout === "row" && "flex flex-row flex-wrap gap-3",
                                       section.layout === "column" || !section.layout && "flex flex-col gap-4"
                                   )}>
                                       {section.fields.map((field: any, idx: number) => (
                                           <motion.div
                                               key={`${field.id}-${idx}-${field.path || idx}`}
                                               initial={{ opacity: 0, x: -4 }}
                                               animate={{ opacity: 1, x: 0 }}
                                               transition={{ delay: idx * 0.02 }}
                                               className="w-full"
                                           >
                                               <ConfigFieldRenderer
                                                   field={field}
                                                   values={values}
                                                   onChange={onChange}
                                               />
                                           </motion.div>
                                       ))}
                                   </div>
                               </motion.div>
                           )}
                       </AnimatePresence>
                   </div>
               </div>
           )}
       </>
    );
}