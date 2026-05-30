'use client';

import React, { useState } from "react";
import {
    Rocket,
    History,
    Settings2,
    EyeOff,
    Copy,
    AlertTriangle,
    Activity,
    Eye,
    X
} from "lucide-react";

// Shadcn UI Imports
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogOverlay,
    DialogPortal
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Accordion } from "@/components/ui/accordion";

// Your Custom Imports
import { useWorkflowEditor } from '@/hooks/workflow/useWorkflowEditor';
import { AppButton } from "@/components/CustomButton";
import { DeployedWorkflow } from "@neuron/db";
import { DeploymentHistoryItem } from "@/components/workflow/editor/Panel/deployment/DeploymentHistoryItem";
import { generateSecureKey } from "@neuron/shared";
import { cn } from "@/lib/utils";

export function DeploymentPanel({
                                    isOpen,
                                    onOpenChange,
                                    workflowName = 'untitled',
                                }: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    workflowName: string;
}) {
    const { editorState, deployWorkflow, deleteDeployment, isDeploying } = useWorkflowEditor();
    const [isPrivate, setIsPrivate] = useState(true);
    const [secretKey, setSecretKey] = useState<string | null>(null);
    const [showKey, setShowKey] = useState(false);

    const generateKey = () => {
        const key = generateSecureKey();
        setSecretKey(key);
        setShowKey(true);
    };

    const deploymentsArray = Object.values(editorState.deployment || {}) ?? [];

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogPortal>

                <DialogContent
                    className={cn(
                        "z-[9999]! p-0 gap-0 overflow-hidden border-2 border-neutral-900 bg-neutral-950 shadow-2xl",
                        "max-h-[85vh] w-full max-w-[850px] flex flex-col no-scrollbar",
                        "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" // Ensures Top-Center logic
                    )}
                >
                    {/* Header Section - Matches your EditorPanel exactly */}
                    <header className="flex flex-col gap-1 border-b border-neutral-800/50 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-primary">
                                    <Rocket size={18} />
                                </div>
                                <div className="flex flex-col">
                                    <DialogTitle className="text-sm font-semibold tracking-tight text-neutral-100">
                                        Mesh Orchestration
                                    </DialogTitle>
                                    <DialogDescription className="text-[11px] leading-relaxed text-neutral-500 mt-1">
                                        Deploy and manage production-grade instances of your workflow.
                                    </DialogDescription>
                                </div>
                            </div>
                            {/* Shadcn handles close, but we can style the button or rely on the primitive */}
                        </div>
                    </header>

                    <Tabs defaultValue="deploy" className="w-full flex flex-col flex-1 overflow-hidden">
                        <TabsList className="bg-white/[0.02] border border-white/[0.05] p-1 h-12 self-start ml-6 mt-4 mb-2">
                            <TabsTrigger value="deploy" className="gap-2 px-6 data-[state=active]:bg-white/[0.05] text-[11px] font-bold uppercase tracking-wider">
                                <Rocket size={14} /> Deploy
                            </TabsTrigger>
                            <TabsTrigger value="history" className="gap-2 px-6 data-[state=active]:bg-white/[0.05] text-[11px] font-bold uppercase tracking-wider">
                                <History size={14} /> Deployment History
                                {deploymentsArray.length > 0 && (
                                    <span className="ml-1 bg-primary text-black px-1.5 py-0.5 rounded-full text-[8px]">
                                        {deploymentsArray.length}
                                    </span>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex-1 overflow-y-auto px-6 pb-7 no-scrollbar">
                            <TabsContent value="deploy" className="m-0 focus-visible:outline-none">
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-7">
                                    {/* Left Column: Config */}
                                    <div className="md:col-span-3 space-y-8">
                                        <section className="space-y-4">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Settings2 size={14} className="text-neutral-500" />
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Environment Setup</h3>
                                            </div>

                                            <div className="space-y-4 bg-white/[0.01] border border-white/[0.03] p-6 rounded-2xl">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <Label className="text-sm font-semibold text-white">Security Protocol</Label>
                                                        <p className="text-[11px] text-neutral-500">Enable private execution for production APIs.</p>
                                                    </div>
                                                    <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
                                                </div>

                                                {isPrivate && (
                                                    <div className="pt-4 border-t border-white/[0.04] space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-600">Access Token</Label>
                                                            {secretKey && (
                                                                <button onClick={() => setShowKey(!showKey)} className="text-neutral-500 hover:text-white transition-colors">
                                                                    {showKey ? <EyeOff size={12} /> : <Eye size={12} />}
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                type={showKey ? "text" : "password"}
                                                                value={secretKey || ''}
                                                                readOnly
                                                                placeholder="No key generated..."
                                                                className="bg-black/40 border-white/5 font-mono text-xs text-primary"
                                                            />
                                                            {!secretKey ? (
                                                                <AppButton label="Generate" onClick={generateKey} className="bg-white text-black px-4 text-[10px] uppercase font-bold" />
                                                            ) : (
                                                                <AppButton
                                                                    icon={<Copy size={14}/>}
                                                                    onClick={() => {navigator.clipboard.writeText(secretKey || '')}}
                                                                    className="bg-white/5 border border-white/10 px-4"
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="flex gap-3 items-center p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                                                            <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                                                            <p className="text-[10px] text-amber-200/50 leading-tight">Key cannot be recovered after this session. Copy and store it in your secrets vault immediately.</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </section>
                                    </div>

                                    {/* Right Column: Info/Summary */}
                                    <div className="md:col-span-2 space-y-6">
                                        <div className="rounded-2xl bg-primary/[0.03] border border-primary/10 p-6 space-y-4">
                                            <div className="flex items-center gap-2">
                                                <Activity size={16} className="text-primary" />
                                                <span className="text-[11px] font-black uppercase tracking-widest text-primary">Deployment Summary</span>
                                            </div>
                                            <div className="space-y-3 h-full">
                                                <SummaryItem label="Workflow" value={workflowName || "Untitled"} />
                                                <SummaryItem label="Nodes" value={Object.keys(editorState.graph.nodes)?.length || 0} />
                                                <SummaryItem label="Mode" value={isPrivate ? "Private" : "Public"} />
                                            </div>
                                            <AppButton
                                                icon={<Rocket size={16} />}
                                                label="Deploy Production"
                                                loading={isDeploying}
                                                disabled={isDeploying || (isPrivate && !secretKey)}
                                                onClick={() => deployWorkflow({ secretKey, private: isPrivate })}
                                                className="w-full h-12 mt-4 bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-xl hover:scale-[1.02] transition-transform"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="history" className="m-0 focus-visible:outline-none">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4 ml-1">
                                        <History size={14} className="text-neutral-500" />
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Live Active Instances</h3>
                                    </div>

                                    {deploymentsArray.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/5 rounded-3xl">
                                            <Rocket size={40} className="text-neutral-800 mb-4" />
                                            <p className="text-[11px] font-bold text-neutral-600 uppercase tracking-widest">No active deployments found</p>
                                        </div>
                                    ) : (
                                        <Accordion type="multiple" className="space-y-3">
                                            {deploymentsArray.map((deployment: DeployedWorkflow) => (
                                                <DeploymentHistoryItem
                                                    key={deployment.id}
                                                    deployment={deployment}
                                                    onDelete={deleteDeployment}
                                                />
                                            ))}
                                        </Accordion>
                                    )}
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
}

function SummaryItem({ label, value }: { label: string, value: string | number }) {
    return (
        <div className="flex justify-between items-center py-1">
            <span className="text-[10px] text-neutral-500 font-bold uppercase">{label}</span>
            <span className="text-xs font-mono text-white">{value}</span>
        </div>
    );
}