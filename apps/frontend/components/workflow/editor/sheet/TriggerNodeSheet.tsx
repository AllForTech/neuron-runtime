"use client";

import { useMemo } from "react";
import { Node } from "reactflow";
import { useWorkflowEditor } from "@/hooks/workflow/useWorkflowEditor";
import { Input } from "@/components/ui/input";
import { SheetWrapper } from "@/components/workflow/editor/SheetWrapper";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { WorkflowEditorActionType } from "@/constants";
import { debounce } from "lodash";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Globe, Clock, MousePointerIcon, Settings2 } from "lucide-react";

export function TriggerNodeConfigSheet({ node, open, onOpen }: { node: Node; open: boolean; onOpen: (open: boolean) => void }) {
    const { workflowEditorDispatch } = useWorkflowEditor();
    const config = node.data;

    // Fixed Debounce Logic
    const debouncedUpdate = useMemo(
        () => debounce((payload: any) => {
            workflowEditorDispatch({
                type: WorkflowEditorActionType.UPDATE_NODE,
                id: node.id,
                payload: { config: payload }
            });
        }, 400),
        [node.id, workflowEditorDispatch]
    );

    const updateConfig = (partial: any) => {
        const nextConfig = { ...config, ...partial };
        debouncedUpdate(nextConfig);
    };

    const handleMetaChange = (value: any) => {
        workflowEditorDispatch({
            type: WorkflowEditorActionType.UPDATE_NODE,
            id: node.id,
            payload: { ...node.data, meta: value }
        });
    };

    return (
        <SheetWrapper
            nodeId={node.id}
            open={open}
            nodeMeta={config.meta}
            onMetaUpdate={handleMetaChange}
            onOpenChange={onOpen}
            title="Trigger Initiation"
        >
            <div className="space-y-8 mt-6">

                {/* SECTION: IDENTITY */}
                <section className="space-y-4">
                    <header className="flex items-center gap-2 text-neutral-400">
                        <Settings2 size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">General Configuration</span>
                    </header>

                    <div className="space-y-1.5">
                        <Label className="text-[11px] text-neutral-500 ml-1">Friendly Name</Label>
                        <Input
                            defaultValue={config?.name ?? ""}
                            onChange={(e) => updateConfig({ name: e.target.value })}
                            placeholder="e.g. Primary Inbound Entry"
                            className="bg-neutral-900/50 border-white/5 focus:border-white/20 h-10 transition-all"
                        />
                    </div>
                </section>

                {/* SECTION: TRIGGER TYPE (Visual Radio Group) */}
                <section className="space-y-4">
                    <header className="flex items-center gap-2 text-neutral-400">
                        <MousePointerIcon size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Activation Method</span>
                    </header>

                    <RadioGroup
                        value={config?.triggerType ?? "manual"}
                        onValueChange={(value) => updateConfig({ triggerType: value })}
                        className="grid grid-cols-1 gap-2"
                    >
                        <TriggerTypeOption
                            value="manual"
                            icon={MousePointerIcon}
                            title="Manual Execution"
                            description="Trigger this sequence directly from the dashboard."
                        />
                        <TriggerTypeOption
                            value="webhook"
                            icon={Globe}
                            title="External Webhook"
                            description="Invoke via an HTTP POST request from another service."
                        />
                        <TriggerTypeOption
                            value="schedule"
                            icon={Clock}
                            title="Scheduled Interval"
                            description="Automate execution based on a specific time frequency."
                        />
                    </RadioGroup>
                </section>

                {/* SECTION: CONDITIONAL PARAMS */}
                {config?.triggerType === "schedule" && (
                    <section className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3 animate-in fade-in slide-in-from-top-2">
                        <Label className="text-[11px] text-neutral-400">Cron Schedule</Label>
                        <Input
                            defaultValue={config.cron ?? ""}
                            onChange={(e) => updateConfig({ cron: e.target.value })}
                            placeholder="* * * * *"
                            className="bg-black/20 border-white/10 font-mono tracking-widest h-9"
                        />
                        <p className="text-[10px] text-neutral-500 italic">Use standard crontab syntax for automated intervals.</p>
                    </section>
                )}

                {config?.triggerType === "webhook" && (
                    <section className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3 animate-in fade-in slide-in-from-top-2">
                        <Label className="text-[11px] text-neutral-400">Endpoint Endpoint URL</Label>
                        <div className="flex gap-2">
                            <Input
                                readOnly
                                value={config?.webhookUrl ?? "https://api.neuron.engine/v1/wh/..."}
                                className="bg-black/20 border-white/10 h-9 text-[11px] truncate"
                            />
                        </div>
                        <p className="text-[10px] text-neutral-500">Secure this endpoint using the environment variables in your workspace.</p>
                    </section>
                )}
            </div>
        </SheetWrapper>
    );
}

// Helper component for the activation options
function TriggerTypeOption({ value, icon: Icon, title, description }: any) {
    return (
        <Label
            className={`
                flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer
                ${'bg-neutral-900/40 border-white/5 hover:bg-neutral-900/60'}
                has-[:checked]:border-white/20 has-[:checked]:bg-white/5
            `}
        >
            <RadioGroupItem value={value} className="sr-only" />
            <div className="mt-1 p-2 rounded-lg bg-white/5 text-white">
                <Icon size={16} />
            </div>
            <div className="space-y-1">
                <p className="text-xs font-semibold text-white tracking-wide">{title}</p>
                <p className="text-[10px] text-neutral-500 leading-relaxed">{description}</p>
            </div>
        </Label>
    );
}