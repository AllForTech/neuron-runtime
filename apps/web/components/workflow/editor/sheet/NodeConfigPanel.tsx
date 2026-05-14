'use client';

import {useMemo, useEffect, useRef, useCallback, useState} from "react";
import { useWorkflowEditor } from "@/hooks/workflow/useWorkflowEditor";
import { useNodeConfigState } from "@/hooks/workflow/config/useNodeConfigState";
import { NodeConfigRenderer } from "@/components/workflow/editor/config/renderer/NodeConfigRenderer";
import { Cpu, Hash, Settings2 } from "lucide-react";
import {headerArrayToObject, headerObjectToArray} from "@/lib/utils";
import {BaseNodeConfig} from "@neuron/shared";
import {WorkflowEditorActionType} from "@/constants";

export default function NodeConfigPanel() {
    const [config, setConfig] = useState<BaseNodeConfig | null>(null);

    const { workflowEditorDispatch, editorState, nodeCatalog, selectedNode } = useWorkflowEditor();
    const editingIdRef = useRef<string | null>(null);

    // Get the fresh node from the store
    const currentNode = editorState.graph.nodes[selectedNode?.id];

    // We keep a ref of the current config to avoid closure staleness in handleConfigChange
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
    }, [workflowEditorDispatch, selectedNode?.id, config]);

    const { values, updateValue, setValues } = useNodeConfigState({
        initialValues: selectedNode?.data || {},
        onChange: handleConfigChange
    });

    const resetConfig = useCallback(() => setConfig(null), [setConfig]);

    useEffect(() => {
        if (!config || !selectedNode?.id || editingIdRef.current !== selectedNode.id) {
            return;
        }

        workflowEditorDispatch({
            type: WorkflowEditorActionType.UPDATE_NODE,
            id: selectedNode.id,
            payload: config
        });

        console.log("Dispatching new config:", config);
        console.log("Current store config:", currentNode.config);

        const timer = setTimeout(() => {
            resetConfig();
        }, 100);

        return () => clearTimeout(timer);

    }, [selectedNode?.id, selectedNode, config, workflowEditorDispatch])

    // EFFECT: Sync local state ONLY when selection changes
    useEffect(() => {
        const selectedId = selectedNode?.id;
        if (!selectedId) {
            editingIdRef.current = null;
            return;
        }

        if (JSON.stringify(selectedNode?.data) !== JSON.stringify(currentNode?.config)) return;

        console.log("syncing Dispatching new config:", config);
        console.log("syncing Current store config:", currentNode.config);

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
        let finalValue = value;

        if (path === 'headers' && Array.isArray(value)) {
            finalValue = headerArrayToObject(value);
        }

        updateValue(path, finalValue);
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
        <div className="flex h-full flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
                <div className="p-4 pb-20">
                    <NodeConfigRenderer
                        key={selectedNode.id}
                        schema={nodeDef}
                        values={values}
                        onChange={handleUpdate}
                    />
                </div>
            </div>

            {/* Technical Metadata Footer */}
            <div className="shrink-0 p-4 bg-neutral-950 border-t border-white/[0.04]">
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