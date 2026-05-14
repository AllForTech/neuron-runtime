'use client';

import React, { useMemo } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Activity,
  Zap,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useValidation } from '@/hooks/useValidation';
import { cn } from '@/lib/utils';

export default function WorkflowInspector() {
  const { errors, isValid, isNodeValid } = useValidation();

  const nodeIdsWithErrors = useMemo(() => Object.keys(errors), [errors]);

    return (
        <div className="flex flex-col h-full w-full bg-transparent">
            <div className="space-y-6 p-4">
                {/* High-Level Status Summary */}
                <div
                    className={cn(
                        'relative overflow-hidden rounded-2xl border p-4 transition-all duration-500',
                        isValid
                            ? 'border-emerald-500/20 bg-white/[0.02]'
                            : 'border-amber-500/20 bg-white/[0.02]'
                    )}
                >
                    <div
                        className={cn(
                            'absolute -top-10 -right-10 h-24 w-24 rounded-full opacity-10 blur-[50px]',
                            isValid ? 'bg-emerald-500' : 'bg-amber-500'
                        )}
                    />

                    <div className="relative z-10 flex items-center gap-4">
                        <div
                            className={cn(
                                'flex h-10 w-10 items-center justify-center rounded-xl border',
                                isValid
                                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                                    : 'border-amber-500/20 bg-amber-500/10 text-amber-400'
                            )}
                        >
                            {isValid ? <ShieldCheck size={20} /> : <Zap size={20} />}
                        </div>
                        <div className="flex-1">
                            <h4 className="text-[13px] font-semibold tracking-tight text-neutral-100">
                                {isValid ? 'Graph Verified' : 'Logic Anomalies'}
                            </h4>
                            <p className="text-[11px] leading-relaxed font-medium text-neutral-500">
                                {isValid
                                    ? 'All neural pathways optimized.'
                                    : `${nodeIdsWithErrors.length} nodes require adjustment.`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Detailed Diagnostics List */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <p className="text-[10px] font-bold tracking-[0.2em] text-neutral-600 uppercase">
                            Neural Diagnostics
                        </p>
                    </div>

                    {nodeIdsWithErrors.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-white/5 rounded-2xl">
                            <CheckCircle2 className="h-6 w-6 text-neutral-800 mb-2" />
                            <p className="text-[11px] font-medium text-neutral-600 italic">
                                Logic is sound.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-2">
                            {nodeIdsWithErrors.map((nodeId) => {
                                const nodeDiagnostic = errors[nodeId];
                                const hasCritical = !isNodeValid(nodeId);

                                return (
                                    <Collapsible
                                        key={nodeId}
                                        className="group overflow-hidden rounded-xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03]"
                                    >
                                        <CollapsibleTrigger className="flex w-full items-center justify-between p-3 text-left">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    'h-1.5 w-1.5 rounded-full',
                                                    hasCritical ? 'bg-red-500' : 'bg-amber-400'
                                                )} />
                                                <span className="truncate text-[12px] font-medium text-neutral-300">
                            {nodeDiagnostic?.meta?.label || 'Untitled Node'}
                        </span>
                                            </div>
                                            <ChevronRight className="h-3 w-3 text-neutral-600 transition-transform group-data-[state=open]:rotate-90" />
                                        </CollapsibleTrigger>

                                        <CollapsibleContent className="px-3 pb-3 space-y-2">
                                            {nodeDiagnostic.errors.map((error, idx) => (
                                                <div key={idx} className="flex gap-2 rounded-lg bg-black/20 p-2.5 border border-white/[0.02]">
                                                    <AlertCircle className={cn("h-3 w-3 mt-0.5", error.level === 'error' ? "text-red-500" : "text-amber-500")} />
                                                    <div className="flex-1">
                                                        <p className="text-[11px] text-neutral-400 leading-snug">{error.message}</p>
                                                        <p className="text-[8px] mt-1 uppercase tracking-tighter text-neutral-600 font-bold">{error.field}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </CollapsibleContent>
                                    </Collapsible>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
