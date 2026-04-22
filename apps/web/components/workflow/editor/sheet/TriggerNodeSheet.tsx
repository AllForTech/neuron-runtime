'use client';

import React, { memo, useEffect, useState } from 'react';
import { Node } from 'reactflow';
import { useWorkflowEditor } from '@/hooks/workflow/useWorkflowEditor';
import { WorkflowEditorActionType } from '@/constants';
import { SheetWrapper } from '@/components/workflow/editor/SheetWrapper';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Globe,
    Clock,
    MousePointer2,
    Copy,
    CheckCircle2,
    AlertCircle,
    Zap
} from 'lucide-react';
import { TriggerNodeConfig } from '@neuron/shared';

function TriggerConfigSheet({
                                node,
                                open,
                                onOpen,
                            }: {
    node: Node;
    open: boolean;
    onOpen: (open: boolean) => void;
}) {
    const { workflowEditorDispatch } = useWorkflowEditor();
    const [copied, setCopied] = useState(false);

    const [config, setConfig] = useState<TriggerNodeConfig>({
        name: 'Primary Inbound Entry',
        triggerType: 'manual',
        cron: '* * * * *',
        ...node.data,
    });

    useEffect(() => {
        const hasChanged = JSON.stringify(config) !== JSON.stringify(node.data);
        if (!hasChanged) return;

        const timer = setTimeout(() => {
            workflowEditorDispatch({
                type: WorkflowEditorActionType.UPDATE_NODE,
                id: node.id,
                payload: config,
            });
        }, 400);

        return () => clearTimeout(timer);
    }, [config, node.data, node.id, workflowEditorDispatch]);

    const handleChange = (key: string, value: any) => {
        setConfig((prev) => ({ ...prev, [key]: value }));
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const webhookUrl = `https://api.neuron.engine/v1/wh/${node.id}`;

    return (
        <SheetWrapper
            nodeId={node.id}
            open={open}
            onOpenChange={onOpen}
            nodeMeta={config.meta}
            onMetaUpdate={handleChange}
            executionConfig={config.executionConfig}
            onExecutionConfigUpdate={(newExec) => handleChange('executionConfig', newExec)}
            title="Trigger Settings"
            className="w-[450px]! border-l border-white/5 bg-[#0A0A0A] p-0! backdrop-blur-3xl"
        >
            <div className="flex h-full flex-col overflow-y-auto custom-scrollbar">

                <div className="space-y-10 p-8">

                    {/* IDENTIFICATION */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="h-1 w-1 rounded-full bg-white" />
                            <Label className="text-[11px] font-semibold tracking-widest text-neutral-400 uppercase">
                                General
                            </Label>
                        </div>
                        <Input
                            value={config.meta.label}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder="Give your trigger a name..."
                            className="h-12 border-white/5 bg-white/[0.02] text-sm font-medium transition-all focus:border-white/20 focus:bg-white/[0.04] rounded-xl"
                        />
                    </div>

                    {/* ACTIVATION METHOD */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="h-1 w-1 rounded-full bg-white" />
                            <Label className="text-[11px] font-semibold tracking-widest text-neutral-400 uppercase">
                                Activation Method
                            </Label>
                        </div>

                        <RadioGroup
                            value={config.triggerType}
                            onValueChange={(value) => handleChange('triggerType', value)}
                            className="grid gap-3"
                        >
                            <ModernTriggerOption
                                value="manual"
                                icon={MousePointer2}
                                title="Manual Run"
                                description="Trigger sequence directly from your workspace."
                                isActive={config.triggerType === 'manual'}
                            />
                            <ModernTriggerOption
                                value="webhook"
                                icon={Globe}
                                title="Webhook"
                                description="Automate via incoming HTTP POST requests."
                                isActive={config.triggerType === 'webhook'}
                            />
                            <ModernTriggerOption
                                value="schedule"
                                icon={Clock}
                                title="Schedule"
                                description="Run at recurring time intervals."
                                isActive={config.triggerType === 'schedule'}
                            />
                        </RadioGroup>
                    </div>

                    {/* DYNAMIC CONFIGURATION */}
                    <div className="space-y-6">
                        {config.triggerType === 'schedule' && (
                            <div className="animate-in fade-in zoom-in-95 space-y-4 rounded-2xl border border-white/5 bg-white/[0.02] p-6 duration-500">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[11px] font-bold text-white uppercase tracking-tight">Cron Expression</Label>
                                    <Clock size={14} className="text-neutral-600" />
                                </div>
                                <Input
                                    value={config.cron}
                                    onChange={(e) => handleChange('cron', e.target.value)}
                                    className="h-11 border-white/10 bg-black/40 font-mono text-emerald-400 focus:ring-0 rounded-lg"
                                />
                                <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                                    <AlertCircle size={12} />
                                    <span>Uses standard crontab frequency syntax.</span>
                                </div>
                            </div>
                        )}

                        {config.triggerType === 'webhook' && (
                            <div className="animate-in fade-in zoom-in-95 space-y-5 rounded-2xl border border-white/5 bg-white/[0.02] p-6 duration-500">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[11px] font-bold text-white uppercase tracking-tight">Webhook URL</Label>
                                    <Zap size={14} className="text-yellow-500/80" />
                                </div>

                                <div
                                    onClick={() => copyToClipboard(webhookUrl)}
                                    className="group relative flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/40 px-4 py-3 transition-all hover:border-white/20 hover:bg-black/60"
                                >
                                    <code className="block truncate text-[11px] text-neutral-300">
                                        {webhookUrl}
                                    </code>
                                    {copied ? (
                                        <CheckCircle2 size={14} className="text-emerald-400" />
                                    ) : (
                                        <Copy size={14} className="text-neutral-500 transition-colors group-hover:text-white" />
                                    )}
                                </div>

                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/5 text-[10px] font-bold text-white">1</div>
                                        <p className="text-[11px] text-neutral-400">Set Method to <span className="font-bold text-white">POST</span></p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/5 text-[10px] font-bold text-white">2</div>
                                        <p className="text-[11px] text-neutral-400 text-pretty">Pass data via <span className="font-bold text-white">JSON Body</span> or <span className="font-bold text-white">Query Params</span></p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </SheetWrapper>
    );
}

function ModernTriggerOption({ value, icon: Icon, title, description, isActive }: any) {
    return (
        <Label
            className={`group relative flex cursor-pointer flex-col gap-1 rounded-2xl border p-5 transition-all duration-300 ${
                isActive
                    ? 'border-white/20 bg-white/[0.04] ring-1 ring-white/10'
                    : 'border-white/5 bg-transparent hover:border-white/10 hover:bg-white/[0.01]'
            } `}
        >
            <RadioGroupItem value={value} className="sr-only" />
            <div className="flex items-center justify-between">
                <div className={`rounded-lg p-2 transition-all duration-300 ${isActive ? 'bg-white text-black' : 'bg-white/5 text-neutral-500 group-hover:text-white'}`}>
                    <Icon size={16} />
                </div>
                {isActive && (
                    <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                )}
            </div>
            <div className="mt-4 space-y-1">
                <p className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-neutral-400'}`}>
                    {title}
                </p>
                <p className="text-[11px] leading-relaxed text-neutral-500 group-hover:text-neutral-400 transition-colors">
                    {description}
                </p>
            </div>
        </Label>
    );
}

export const TriggerNodeConfigSheet = memo(TriggerConfigSheet);