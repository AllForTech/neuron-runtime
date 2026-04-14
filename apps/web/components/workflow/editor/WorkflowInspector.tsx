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
import { EditorPanel } from './EditorPanel';
import { useValidation } from '@/hooks/useValidation';
import { cn } from '@/lib/utils';
import { useWorkflowEditor } from '@/hooks/workflow/useWorkflowEditor';

export function WorkflowInspector() {
  const { errors, isValid, isNodeValid } = useValidation();
  const { isWorkflowInspectorOpen, setIsWorkflowInspectorOpen } =
    useWorkflowEditor();

  const nodeIdsWithErrors = useMemo(() => Object.keys(errors), [errors]);

  return (
    <EditorPanel
      open={isWorkflowInspectorOpen}
      onOpenChange={setIsWorkflowInspectorOpen}
      title="Integrity Monitor"
      description="Real-time heuristic analysis of the neuron editor."
      icon={<Activity className="h-5 w-5" />}
      position="Top Right"
      width="w-[450px]"
      className={'h-[90dvh]!'}
    >
      <div className="space-y-6 p-2">
        {/* High-Level Status Summary */}
        <div
          className={cn(
            'relative overflow-hidden rounded-2xl border p-4 transition-all duration-500',
            isValid
              ? 'border-emerald-500/20 bg-white/[0.02]'
              : 'border-amber-500/20 bg-white/[0.02]'
          )}
        >
          {/* Subtle accent glow */}
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
                {isValid ? 'Graph Verified' : 'Logic Anomalies Detected'}
              </h4>
              <p className="text-[11px] leading-relaxed font-medium text-neutral-500">
                {isValid
                  ? 'All neural pathways are optimized and ready for deployment.'
                  : `${nodeIdsWithErrors.length} nodes require configuration adjustments to stabilize.`}
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
            {nodeIdsWithErrors.length > 0 && (
              <span className="rounded-full border border-neutral-700 bg-neutral-800 px-2 py-0.5 font-mono text-[9px] text-neutral-400">
                {nodeIdsWithErrors.length} ISSUES
              </span>
            )}
          </div>

          {nodeIdsWithErrors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900">
                <CheckCircle2 className="h-6 w-6 text-neutral-700" />
              </div>
              <p className="text-[11px] font-medium text-neutral-500 italic">
                Logic is sound. No anomalies found.
              </p>
            </div>
          ) : (
            nodeIdsWithErrors.map((nodeId) => {
              const nodeDiagnostic = errors[nodeId];
              const hasCritical = !isNodeValid(nodeId);

              return (
                <Collapsible
                  key={nodeId}
                  className="group rounded-xl border border-neutral-800 bg-neutral-900/40 hover:border-neutral-700 hover:bg-neutral-800/40 data-[state=open]:border-white/20 data-[state=open]:bg-white/[0.02]"
                >
                  <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl border border-neutral-800/50 p-3.5 text-left transition-all">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'h-2 w-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]',
                          hasCritical
                            ? 'bg-red-500 shadow-red-500/20'
                            : 'bg-amber-400 shadow-amber-400/20'
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="block max-w-[200px] truncate text-[12px] font-semibold text-neutral-200">
                          {nodeDiagnostic?.meta?.label || 'Untitled Node'}
                        </span>
                        <span className="font-mono text-[9px] text-neutral-600 opacity-60">
                          ID: {nodeId.split('-')[0]}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-neutral-700 group-data-[state=open]:hidden">
                        {nodeDiagnostic.errors.length}
                      </span>
                      <ChevronRight className="h-4 w-4 text-neutral-600 transition-transform group-data-[state=open]:rotate-90" />
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="animate-in slide-in-from-top-1 space-y-2 bg-neutral-950/50 duration-200">
                    {nodeDiagnostic.errors.map((error, idx) => (
                      <div
                        key={idx}
                        className="flex gap-3 rounded-md border border-white/[0.02] p-3"
                      >
                        <div className="mt-0.5 shrink-0">
                          {error.level === 'error' ? (
                            <AlertCircle className="h-3.5 w-3.5 text-red-500/80" />
                          ) : (
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500/80" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-[11px] leading-normal font-medium text-neutral-300">
                            {error.message}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold tracking-widest text-neutral-600 uppercase">
                              Scope: {error.field}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              );
            })
          )}
        </div>
      </div>
    </EditorPanel>
  );
}
