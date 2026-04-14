'use client';

import React, { memo, useEffect, useState } from 'react';
import { Node } from 'reactflow';
import {
    Brain,
    ShieldCheck,
    Settings2,
    Sparkles,
    Scale,
    Info,
    Braces,
    ExternalLink,
} from 'lucide-react';

import { useWorkflowEditor } from '@/hooks/workflow/useWorkflowEditor';
import { WorkflowEditorActionType } from '@/constants';
import { SheetWrapper } from '@/components/workflow/editor/SheetWrapper';
import { getAvailableUpstreamNodes } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { PromptOrchestrator } from '@/components/workflow/editor/sheet/PromptOrchestrator';
import { LLMNodeConfig } from '@neuron/shared';
import { SchemaDialog } from '@/components/workflow/editor/dialog/SchemaDialog';
import { TemplateTextarea } from "../TemplateTextarea";

const LLM_PROVIDERS = [
    { label: 'OpenAI', value: 'openai', icon: '🟢' },
    { label: 'Anthropic', value: 'anthropic', icon: '🟠' },
    { label: 'Google Gemini', value: 'gemini', icon: '🔵' },
    { label: 'Ollama (Local)', value: 'ollama', icon: '🦙' },
];

const LLM_MODELS: Record<string, { label: string; value: string }[]> = {
    openai: [
        { label: 'GPT-4o', value: 'gpt-4o' },
        { label: 'GPT-4o Mini', value: 'gpt-4o-mini' },
    ],
    anthropic: [
        { label: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet-20240620' },
    ],
    gemini: [{ label: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro' }],
    ollama: [
        { label: 'Llama 3 (8B)', value: 'llama3' },
        { label: 'Mistral', value: 'mistral' },
    ],
};

function LLMConfigSheet({
                            node,
                            open,
                            onOpen,
                        }: {
    node: Node;
    open: boolean;
    onOpen: (open: boolean) => void;
}) {
    const {
        workflowEditorDispatch,
        editorState: {
            graph: { nodes, edges },
        },
    } = useWorkflowEditor();

    // 1. Initialize local state from node config
    const [config, setConfig] = useState<LLMNodeConfig>({
        provider: 'openai',
        model: 'gpt-4o',
        systemPrompt: '',
        userPrompt: '',
        temperature: 0.7,
        outputSchema: '',
        maxTokens: 2048,
        jsonMode: false,
        apiKey: '{{Vault.OPENAI_API_KEY}}',
        ...node.data,
    });

    const availableVariables = getAvailableUpstreamNodes(node.id, {
        nodes,
        edges,
    });

    // 2. Debounced sync to global workflow state
    useEffect(() => {
        const hasChanged = JSON.stringify(config) !== JSON.stringify(node.data);
        if (!hasChanged) return;

        const timer = setTimeout(() => {
            workflowEditorDispatch({
                type: WorkflowEditorActionType.UPDATE_NODE,
                id: node.id,
                payload: config,
            });
        }, 300);
        return () => clearTimeout(timer);
    }, [config, node.id, workflowEditorDispatch]);

    const handleChange = (key: string, value: any) => {
        setConfig((prev) => ({ ...prev, [key]: value }));
    };

    const handleProviderChange = (val: string) => {
        setConfig((prev) => ({
            ...prev,
            provider: val,
            model: LLM_MODELS[val]?.[0]?.value || '',
        }));
    };

    return (
        <SheetWrapper
            open={open}
            onOpenChange={onOpen}
            nodeId={node.id}
            nodeMeta={config?.meta}
            onMetaUpdate={handleChange}
            executionConfig={config.executionConfig}
            onExecutionConfigUpdate={(newExec) =>
                handleChange('executionConfig', newExec)
            }
            title="AI Brain Configuration"
            className="w-[550px]! border-l border-neutral-800 bg-neutral-950/95 p-0! backdrop-blur-2xl"
        >
            <div className="flex h-full flex-col overflow-hidden">
                {/* STATUS SUB-HEADER */}
                <div className="flex items-center justify-between border-b border-neutral-800/50 bg-neutral-900/40 px-6 py-3">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Brain className="h-3.5 w-3.5 text-purple-400" />
                            <span className="font-mono text-[10px] text-neutral-400">
                Node Type: Inference
              </span>
                        </div>
                    </div>
                    <Badge
                        variant="outline"
                        className="border-neutral-800 text-[9px] tracking-tight text-neutral-500 uppercase"
                    >
                        Aggregator Node
                    </Badge>
                </div>

                <ScrollArea className="flex-1">
                    <div className="space-y-8 p-6 px-4!">
                        {/* SECTION 1: SYSTEM TOPOLOGY */}
                        <div className="space-y-4">
                            <div className="mb-2 flex items-center gap-2">
                                <div className="rounded-md bg-blue-500/10 p-1.5">
                                    <Settings2 className="h-3.5 w-3.5 text-blue-500" />
                                </div>
                                <h4 className="text-[11px] font-bold tracking-widest text-neutral-200 uppercase">
                                    System Topology
                                </h4>
                            </div>

                            <div className="grid grid-cols-2 gap-4 rounded-xl border border-neutral-800/50 bg-neutral-900/20 p-4">
                                <div className="space-y-2">
                                    <label className="ml-1 text-[10px] font-semibold text-neutral-500">
                                        AI Provider
                                    </label>
                                    <Select
                                        value={config.provider}
                                        onValueChange={handleProviderChange}
                                    >
                                        <SelectTrigger className="h-9 border-neutral-800 bg-neutral-900/50 text-xs focus:ring-blue-500/50">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="border-neutral-800 bg-neutral-950">
                                            {LLM_PROVIDERS.map((p) => (
                                                <SelectItem
                                                    key={p.value}
                                                    value={p.value}
                                                    className="text-xs"
                                                >
                                                    <span className="mr-2">{p.icon}</span> {p.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="ml-1 text-[10px] font-semibold text-neutral-500">
                                        Model Profile
                                    </label>
                                    <Select
                                        value={config.model}
                                        onValueChange={(val) => handleChange('model', val)}
                                    >
                                        <SelectTrigger className="h-9 border-neutral-800 bg-neutral-900/50 text-xs focus:ring-blue-500/50">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="border-neutral-800 bg-neutral-950">
                                            {LLM_MODELS[config.provider]?.map((m) => (
                                                <SelectItem
                                                    key={m.value}
                                                    value={m.value}
                                                    className="text-xs"
                                                >
                                                    {m.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="col-span-2 space-y-2">
                                    <label className="ml-1 flex items-center gap-1.5 text-[10px] font-semibold text-neutral-500">
                                        <ShieldCheck className="h-3 w-3 text-emerald-500" /> API
                                        Gateway Credentials
                                    </label>
                                    <TemplateTextarea
                                        variables={availableVariables}
                                        value={config.apiKey}
                                        onChange={(value) => handleChange('apiKey', value)}
                                        className="h-9 border-neutral-800 bg-black/60 text-xs focus:border-neutral-500/50"
                                        placeholder="{{Vault.OPENAI_API_KEY}}"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: HYPERPARAMETERS */}
                        <div className="space-y-4 border-t border-neutral-900 pt-4">
                            <div className="mb-2 flex items-center gap-2">
                                <div className="rounded-md bg-amber-500/10 p-1.5">
                                    <Scale className="h-3.5 w-3.5 text-amber-500" />
                                </div>
                                <h4 className="text-[11px] font-bold tracking-widest text-neutral-200 uppercase">
                                    Hyperparameters
                                </h4>
                            </div>

                            <div className="space-y-6 rounded-xl border border-neutral-800/50 bg-neutral-900/20 p-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[10px] font-bold text-neutral-400">
                                            Temperature
                                        </label>
                                        <span className="rounded border border-neutral-700 bg-neutral-800 px-1.5 py-0.5 font-mono text-xs text-white">
                      {config.temperature.toFixed(1)}
                    </span>
                                    </div>
                                    <Slider
                                        value={[config.temperature]}
                                        max={1}
                                        step={0.1}
                                        onValueChange={([val]) => handleChange('temperature', val)}
                                        className="py-2"
                                    />
                                    <div className="flex justify-between font-mono text-[9px] tracking-wider text-neutral-600">
                                        <span>Precise (0.0)</span>
                                        <span>Creative (1.0)</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div className="space-y-2">
                                        <label className="ml-1 text-[10px] font-bold text-neutral-400">
                                            Max Tokens
                                        </label>
                                        <Input
                                            type="number"
                                            value={config.maxTokens}
                                            onChange={(e) =>
                                                handleChange('maxTokens', Number(e.target.value))
                                            }
                                            className="h-9 border-neutral-800 bg-black/60 text-xs"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="ml-1 text-[10px] font-bold text-neutral-400">
                                            Structured Output
                                        </label>
                                        <div className="flex h-9 items-center justify-between rounded-lg border border-neutral-800 bg-black/60 px-3">
                      <span className="flex items-center gap-1.5 text-xs text-neutral-400">
                        <Braces className="h-3 w-3" /> JSON Mode
                      </span>
                                            <Switch
                                                checked={config.jsonMode}
                                                onCheckedChange={(checked) =>
                                                    handleChange('jsonMode', checked)
                                                }
                                                className="data-[state=checked]:bg-emerald-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {config.jsonMode && (
                                    <SchemaDialog
                                        value={config.outputSchema ?? ''}
                                        onChange={(val) => handleChange('outputSchema', val)}
                                    />
                                )}
                            </div>
                        </div>

                        {/* SECTION 3: PROMPT ORCHESTRATOR */}
                        <div className="space-y-4 border-t border-neutral-900 pt-4">
                            <div className="mb-2 flex items-center gap-2 px-1">
                                <Sparkles className="h-3.5 w-3.5 text-white" />
                                <h4 className="text-[11px] font-bold tracking-widest text-neutral-200 uppercase">
                                    Execution Logic
                                </h4>
                            </div>

                            <PromptOrchestrator
                                systemPrompt={config.systemPrompt}
                                userPrompt={config.userPrompt}
                                variables={availableVariables}
                                onUpdate={handleChange}
                                modelName={config.model}
                            />
                        </div>

                        {/* HELPER FOOTER BOX */}
                        <div className="flex gap-4 rounded-xl border border-blue-500/10 bg-blue-500/5 p-4">
                            <div className="h-fit rounded-lg bg-blue-500/10 p-2">
                                <Info className="h-4 w-4 text-blue-400" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[11px] font-semibold text-neutral-300">
                                    Context Window Compression Enabled
                                </p>
                                <p className="text-[10px] leading-normal text-neutral-500">
                                    The active node automatically shrinks prompt lengths to save
                                    on cost. Access upstream objects using the{' '}
                                    <code className="rounded bg-purple-400/5 px-1 text-purple-400">
                                        {'{{node_id}}'}
                                    </code>{' '}
                                    token.
                                </p>
                                <button className="flex items-center gap-1 pt-1 text-[10px] font-medium text-blue-500 hover:underline">
                                    View latency benchmarks{' '}
                                    <ExternalLink className="h-2.5 w-2.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </div>
        </SheetWrapper>
    );
}

export const LLMNodeConfigSheet = memo(LLMConfigSheet);
