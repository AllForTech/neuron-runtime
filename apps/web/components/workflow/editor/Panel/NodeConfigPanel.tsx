'use client';

import React, { useMemo, useEffect, useRef, useCallback, useState } from "react";
import { useWorkflowEditor } from "@/hooks/workflow/useWorkflowEditor";
import { NodeConfigRenderer } from "@/components/workflow/editor/config/renderer/NodeConfigRenderer";
import { Cpu, Hash, Settings2, Maximize2, Sparkles } from "lucide-react";
import { headerObjectToArray } from "@/lib/utils";
import { BaseNodeConfig } from "@neuron/shared";
import { WorkflowEditorActionType } from "@/constants";

// Import your themed Dialog components
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useNodeConfigState } from "@/hooks/workflow/config/useNodeConfigState";

export default function NodeConfigPanel() {
    const [config, setConfig] = useState<BaseNodeConfig | null>(null);
    const [isExpanded, setIsExpanded] = useState(false); // Track dialog state

    const { workflowEditorDispatch, editorState, nodeCatalog, selectedNode } = useWorkflowEditor();
    const editingIdRef = useRef<string | null>(null);

    const currentNode = editorState.graph.nodes[selectedNode?.id];
    const currentConfigRef = useRef(currentNode?.config);

    useEffect(() => {
        currentConfigRef.current = currentNode?.config;
    }, [currentNode?.config]);

    useEffect(() => {
        if (selectedNode?.id) {
            setConfig(null);
            editingIdRef.current = selectedNode.id;
        }
    }, [selectedNode?.id]);

    const handleConfigChange = useCallback((newConfig: any) => {
        const nodeId = editingIdRef.current || selectedNode?.id;
        if (!nodeId) return;
        setConfig(newConfig);
        workflowEditorDispatch({
            type: WorkflowEditorActionType.UPDATE_NODE,
            id: nodeId,
            payload: newConfig
        });
    }, [workflowEditorDispatch, selectedNode?.id]);

    const { values, updateValue, setValues } = useNodeConfigState({
        initialValues: selectedNode?.data || {},
        onChange: handleConfigChange
    });

    const resetConfig = useCallback(() => setConfig(null), [setConfig]);

    useEffect(() => {
        if (!config || !selectedNode?.id || editingIdRef.current !== selectedNode.id) return;
        workflowEditorDispatch({
            type: WorkflowEditorActionType.UPDATE_NODE,
            id: selectedNode.id,
            payload: config
        });
        const timer = setTimeout(() => { resetConfig(); }, 100);
        return () => clearTimeout(timer);
    }, [selectedNode?.id, selectedNode, config, workflowEditorDispatch]);

    useEffect(() => {
        const selectedId = selectedNode?.id;
        if (!selectedId) {
            editingIdRef.current = null;
            return;
        }
        if (JSON.stringify(selectedNode?.data) !== JSON.stringify(currentNode?.config)) return;
        if (editingIdRef.current !== selectedId) {
            editingIdRef.current = selectedId;
            const data: any = { ...selectedNode?.data || {} };
            if (data.headers && !Array.isArray(data.headers)) {
                data.headers = headerObjectToArray(data.headers);
            }
            setValues(data);
        }
    }, [selectedNode?.id, selectedNode, setValues, config, currentNode?.config]);

    const nodeDef = useMemo(() =>
            nodeCatalog.find(n => n.type === selectedNode?.type)?.schema,
        [selectedNode?.type, nodeCatalog]);

    const handleUpdate = useCallback((path: string, value: any) => {
        updateValue(path, value);
    }, [updateValue]);

    if (!selectedNode || !nodeDef || !currentNode) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-neutral-600">
                <Settings2 className="mb-4 opacity-20" size={32} />
                <p className="text-xs font-medium uppercase tracking-widest">No Node Selected</p>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col bg-transparent">
            {/* Header with Expand Trigger */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04] bg-neutral-950/20">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    <span className="text-[10px] font-bold tracking-[0.2em] text-neutral-400 uppercase">
                        Advance
                    </span>
                </div>

                <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
                    <DialogTrigger asChild>
                        <button className="p-1.5 rounded-md text-neutral-600 hover:text-white hover:bg-white/[0.05] transition-all group">
                            <Maximize2 size={12} className="group-hover:scale-110 transition-transform" />
                        </button>
                    </DialogTrigger>

                    <DialogContent className="max-w-[90vw] w-[1200px] h-[85vh] p-0 bg-neutral-950 border-neutral-900 shadow-2xl flex flex-col overflow-hidden">
                        {/* Themed Dialog Header */}
                        <DialogHeader className="px-8 py-6 border-b border-white/[0.04] flex-row items-center justify-between space-y-0 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white">
                                    <Sparkles size={18} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <DialogTitle className="text-sm font-bold tracking-tight text-white">
                                        {selectedNode?.data?.meta?.name || selectedNode?.type}
                                    </DialogTitle>
                                    <p className="text-[11px] text-neutral-500 mt-0.5">Advanced Configuration Engine</p>
                                </div>
                            </div>
                        </DialogHeader>

                        {/* Large Render Area */}
                        <div className="flex-1 overflow-y-auto p-12 scrollbar-thin scrollbar-thumb-white/[0.05]">
                            <div className="max-w-3xl mx-auto">
                                <NodeConfigRenderer
                                    schema={nodeDef}
                                    values={values}
                                    onChange={handleUpdate}
                                />
                            </div>
                        </div>

                        {/* Dialog Footer */}
                        <div className="px-8 py-4 bg-white/[0.01] border-t border-white/[0.04] flex justify-end">
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="px-6 py-2 rounded-lg bg-white text-black text-[11px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Standard Panel Content (Always visible/rendered) */}
            <div className="flex-1 h-fit w-full!">
                <div className="p-4 px-1.5! pb-20">
                    <NodeConfigRenderer
                        key={selectedNode.id}
                        schema={nodeDef}
                        values={values}
                        onChange={handleUpdate}
                    />
                </div>
            </div>

            {/* Technical Metadata Footer */}
            <div className="shrink-0 p-4 bg-neutral-950/40 border-t border-white/[0.04]">
                <div className="flex items-center justify-between opacity-50 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-3">
                        <Hash size={10} className="text-neutral-500" />
                        <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider">
                            {selectedNode.id.split('-')[0]}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Cpu size={9} className="text-neutral-500" />
                        <span className="text-[9px] font-semibold text-neutral-400 uppercase tracking-wider">
                            {selectedNode.type}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}