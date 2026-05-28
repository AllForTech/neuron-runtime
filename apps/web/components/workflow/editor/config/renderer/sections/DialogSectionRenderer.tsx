'use client';

import React, { useState, useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Settings, Sparkles, ChevronRight, RotateCcw, PanelLeftClose } from 'lucide-react';
import { ConfigFieldRenderer } from "../ConfigFieldRenderer";
import { NodeConfigSection } from "@neuron/shared";

interface DialogSectionProps {
    section: NodeConfigSection;
    values: Record<string, any>;
    onChange: (path: string, value: any) => void;
    defaultValues?: Record<string, any>;
}

export function DialogSectionRenderer({ section, values, onChange, defaultValues }: DialogSectionProps) {
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<string>(section.fields[0]?.id || 'general');
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

    const categories = useMemo(() => {
        return section.fields.map((f: any) => ({
            id: f.id || f.path,
            label: f.label || 'General',
            icon: f.icon || Settings
        }));
    }, [section.fields]);

    const activeField = useMemo(() => {
        return section.fields.find((f: any) => (f.id || f.path) === activeTab);
    }, [section.fields, activeTab]);

    const isDirty = useMemo(() => {
        return JSON.stringify(values) !== JSON.stringify(defaultValues);
    }, [values, defaultValues]);

    const handleReset = () => {
        if (defaultValues) {
            Object.entries(defaultValues).forEach(([path, val]) => onChange(path, val));
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        "relative flex items-center justify-between w-full rounded-2xl border border-white/[0.04] bg-white/[0.02] backdrop-blur-sm p-4",
                        "transition-all duration-300 hover:border-white/[0.08] hover:bg-white/[0.03] active:scale-[0.98]",
                        "group",
                        open && "border-white/10 bg-white/[0.05]"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "flex items-center justify-center w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] transition-all duration-300",
                            "text-neutral-500 group-hover:text-white",
                            isDirty && "border-amber-500/30 text-amber-500"
                        )}>
                            <Settings size={13} strokeWidth={1.5} />
                        </div>
                        <div className="flex flex-col items-start text-left">
                            <div className="flex items-center gap-2">
                                <h3 className="text-[11px] font-semibold tracking-wide text-neutral-300">
                                    {section.title}
                                </h3>
                                {isDirty && <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />}
                            </div>
                            {section.description && (
                                <p className="text-[10px] text-neutral-600 mt-0.5 line-clamp-1">{section.description}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-neutral-600 group-hover:text-neutral-400 font-medium">
                            {isDirty ? 'Unsaved' : 'Configure'}
                        </span>
                        <ChevronRight size={12} className="text-neutral-600 group-hover:text-neutral-400 transition-transform group-hover:translate-x-0.5" />
                    </div>
                </button>
            </DialogTrigger>

            <DialogContent
                className={cn(
                    "h-[83dvh] w-[88dvw] max-w-[850px] no-scrollbar rounded-2xl border-2 border-neutral-900 bg-neutral-950 backdrop-blur-2xl",
                    "p-0 overflow-hidden shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] flex flex-col",
                    "focus:outline-none"
                )}
            >
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-neutral-950/50" />
                </div>

                <DialogHeader className="relative px-6 py-4 border-b border-white/[0.04] flex-row items-center justify-between space-y-0 h-[60px] shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white shadow-[0_0_12px_-4px_rgba(255,255,255,0.15)]">
                            <Sparkles size={13} strokeWidth={1.5} />
                        </div>
                        <div>
                            <DialogTitle className="text-[11px] font-semibold tracking-wide text-neutral-300">
                                {section.title}
                            </DialogTitle>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex flex-1 overflow-hidden h-full no-scrollbar">
                    {/* Collapsible Sidebar */}
                    <aside
                        onMouseEnter={() => setIsSidebarExpanded(true)}
                        onMouseLeave={() => setIsSidebarExpanded(false)}
                        className={cn(
                            "border-r border-white/[0.04] bg-white/[0.01] p-3 flex flex-col gap-1 transition-all duration-500 ease-in-out no-scrollbar shrink-0 z-20",
                            isSidebarExpanded ? "w-48" : "w-[60px]"
                        )}
                    >
                        <div className="flex items-center justify-center h-6 mb-2">
                            <p className={cn(
                                "text-[9px] font-bold text-neutral-700 uppercase tracking-[0.15em] transition-opacity duration-300 whitespace-nowrap",
                                isSidebarExpanded ? "opacity-100" : "opacity-0"
                            )}>
                                Categories
                            </p>
                        </div>

                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveTab(cat.id)}
                                className={cn(
                                    "flex items-center rounded-lg text-[11px] font-medium transition-all group overflow-hidden h-9 shrink-0",
                                    activeTab === cat.id
                                        ? "bg-white/[0.06] text-white border border-white/[0.07] shadow-inner"
                                        : "text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.02] border border-transparent",
                                    isSidebarExpanded ? "px-3 gap-2.5" : "px-0 justify-center"
                                )}
                            >
                                <cat.icon size={12} className={cn(
                                    "shrink-0",
                                    activeTab === cat.id ? "text-white" : "text-neutral-700 group-hover:text-neutral-500"
                                )} />
                                {isSidebarExpanded && (
                                    <span className="truncate animate-in fade-in slide-in-from-left-1 duration-300 whitespace-nowrap">
                                        {cat.label}
                                    </span>
                                )}
                            </button>
                        ))}
                    </aside>

                    <main className="flex-1 overflow-y-auto no-scrollbar p-8 relative">
                        <div className="max-w-xl mx-auto flex flex-col gap-8 no-scrollbar">
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {activeField && (
                                    <ConfigFieldRenderer
                                        field={activeField}
                                        values={values}
                                        onChange={onChange}
                                    />
                                )}
                            </div>
                        </div>
                    </main>
                </div>

                <footer className="relative flex items-center justify-between px-6 py-4 border-t border-white/[0.04] bg-[#0D0D0D] h-[68px] shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleReset}
                            disabled={!isDirty}
                            className="flex items-center gap-2 text-[10px] font-bold text-neutral-600 hover:text-amber-500 disabled:opacity-0 transition-all uppercase tracking-widest"
                        >
                            <RotateCcw size={10} />
                            Reset Defaults
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            className="h-8 text-[11px] text-neutral-500 hover:text-white hover:bg-white/[0.05] px-4"
                            onClick={() => setOpen(false)}
                        >
                            Discard
                        </Button>
                        <Button
                            className="h-8 rounded-lg bg-white px-5 text-neutral-950 hover:bg-neutral-200 transition-all active:scale-[0.97] shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)]"
                            onClick={() => setOpen(false)}
                        >
                            <span className="text-[11px] font-bold uppercase tracking-tight">Apply Changes</span>
                        </Button>
                    </div>
                </footer>
            </DialogContent>
        </Dialog>
    );
}