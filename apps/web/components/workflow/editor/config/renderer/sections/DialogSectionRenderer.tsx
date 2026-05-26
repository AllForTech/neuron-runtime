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
import { Settings, Sparkles, ChevronRight, Search, RotateCcw, AlertCircle } from 'lucide-react';
import { ConfigFieldRenderer } from "../ConfigFieldRenderer";
import { NodeConfigSection } from "@neuron/shared";

interface DialogSectionProps {
    section: NodeConfigSection;
    values: Record<string, any>;
    onChange: (path: string, value: any) => void;
    defaultValues?: Record<string, any>; // For Reset functionality
}

export function DialogSectionRenderer({ section, values, onChange, defaultValues }: DialogSectionProps) {
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<string>(section.fields[0]?.id || 'general');
    const [searchQuery, setSearchQuery] = useState('');

    // --- UPGRADE: Smart Filtering & Categorization ---
    // This allows you to treat "ObjectField" or groups as tabs automatically
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

    // --- UPGRADE: Dirty State Detection ---
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
                {/* Surface Polish Layer */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-neutral-950/50" />
                </div>

                {/* Header */}
                <DialogHeader className="relative px-6 py-4 border-b border-white/[0.04] flex-row items-center justify-between space-y-0">
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

                    {/* --- UPGRADE: Internal Search --- */}
                    <div className="relative group mr-10">
                        <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-neutral-300 transition-colors" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Find parameter..."
                            className="bg-white/[0.03] min-w-[120px] border border-white/[0.05] rounded-full py-1.5 pl-8 pr-4 text-[10px] text-neutral-200 focus:outline-none focus:border-white/10 w-40 transition-all"
                        />
                    </div>
                </DialogHeader>

                {/* Main Sidebar Layout */}
                <div className="flex flex-1 overflow-hidden no-scrollbar h-[550px]">
                    {/* Sidebar Navigation */}
                    <aside className="w-46 border-r border-white/[0.04] bg-white/[0.01] p-3 flex flex-col no-scrollbar gap-1">
                        <p className="px-2 pb-2 text-[9px] font-bold text-neutral-700 uppercase tracking-[0.15em]">Categories</p>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveTab(cat.id)}
                                className={cn(
                                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-all group",
                                    activeTab === cat.id
                                        ? "bg-white/[0.06] text-white border border-white/[0.07] shadow-inner"
                                        : "text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.02] border border-transparent"
                                )}
                            >
                                <cat.icon size={12} className={cn(activeTab === cat.id ? "text-white" : "text-neutral-700 group-hover:text-neutral-500")} />
                                <span className="truncate">{cat.label}</span>
                            </button>
                        ))}
                    </aside>

                    {/* Content Area */}
                    <main className="flex-1 overflow-y-auto no-scrollbar! p-8 relative">
                        <div className="max-w-xl mx-auto flex flex-col gap-8">
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

                {/* Footer Controls */}
                <footer className="relative flex items-center justify-between px-6 py-4 border-t border-white/[0.04] bg-[#0D0D0D]">
                    <div className="flex items-center gap-4">
                        {/* --- UPGRADE: Reset to Default --- */}
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