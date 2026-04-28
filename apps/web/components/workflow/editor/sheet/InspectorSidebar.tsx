'use client';

import { useMemo, useEffect } from "react";
import { useWorkflowEditor } from "@/hooks/workflow/useWorkflowEditor";
import { useNodeConfigState } from "@/hooks/workflow/config/useNodeConfigState";
import { WorkflowEditorActionType } from "@/constants";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NodeConfigRenderer } from "@/components/workflow/editor/config/renderer/NodeConfigRenderer";
import { SheetWrapper } from "@/components/workflow/editor/SheetWrapper";
import { WorkflowNode } from "@neuron/shared";
import {MOCK_CONFIG_SCHEMA} from "@/constants/test";
import {Node} from "reactflow";

interface NodeInspectorSheetProps {
    node: Node | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const testValue = {
    "metadata": {
        "name": "New AI Node"
    },
    "provider": "openai",
    "retry": {
        "enabled": true,
        "maxAttempts": 5
    },
    "headers": [
        { "key": "Authorization", "value": "Bearer sk-..." }
    ],
    "body": {
        "type": "json",
        "raw": "{}"
    }
}

export function NodeInspectorSheet({ node, open, onOpenChange }: NodeInspectorSheetProps) {
    const { workflowEditorDispatch, nodeCatalog } = useWorkflowEditor();

    // 1. Get the definition/schema for the node type
    // const nodeDef = useMemo(() =>
    //         nodeCatalog.find(n => n.type === node?.type),
    //     [node, nodeCatalog]);

    // 2. Initialize the state hook
    const { values, updateValue, setValues } = useNodeConfigState({
        initialValues: testValue || {},
        onChange: (newConfig) => {
            if (!node) return;

            // // Sync the updated config back to the global workflow state
            // workflowEditorDispatch({
            //     type: WorkflowEditorActionType.UPDATE_NODE,
            //     id: node.id,
            //     payload: { config: newConfig }
            // });

            console.log("[Node Config Schema Builder]: ", newConfig);
        }
    });

    // 3. EFFECT: Reset the internal form values whenever the 'node' prop changes
    // This prevents the config of the previous node from showing up in the new one
    useEffect(() => {
        if (node?.data?.config) {
            setValues(node?.data?.config);
        }
    }, [node?.id, setValues]);

    if (!node) return null;

    return (
        <SheetWrapper
            title={node?.data?.config?.meta?.label}
            open={open}
            onOpenChange={onOpenChange}
            className="w-[450px] border-l border-white/5 bg-[#050505] p-0! backdrop-blur-2xl"
        >
            <div className="flex h-full flex-col">
                <ScrollArea className="flex-1">
                    <div className="p-6 pb-24">
                        {/* Render the schema-driven fields */}
                        <NodeConfigRenderer
                            schema={MOCK_CONFIG_SCHEMA}
                            values={values}
                            onChange={updateValue}
                        />
                    </div>
                </ScrollArea>

                {/* Optional Footer for Actions */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#050505]/80 border-t border-white/5 backdrop-blur-md">
                    <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                        <span>NODE_ID: {node?.id.slice(0, 8)}...</span>
                        <span className="uppercase">{node?.type}</span>
                    </div>
                </div>

                <pre className="text-[10px] bg-black/50 p-2 rounded mt-4 overflow-auto max-h-40 font-mono text-emerald-500">
  {JSON.stringify(values, null, 2)}
</pre>
            </div>
        </SheetWrapper>
    );
}