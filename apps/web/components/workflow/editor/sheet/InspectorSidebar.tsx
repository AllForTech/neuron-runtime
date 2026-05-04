'use client';

import {useMemo, useEffect, useRef} from "react";
import { useWorkflowEditor } from "@/hooks/workflow/useWorkflowEditor";
import { useNodeConfigState } from "@/hooks/workflow/config/useNodeConfigState";
import { WorkflowEditorActionType } from "@/constants";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NodeConfigRenderer } from "@/components/workflow/editor/config/renderer/NodeConfigRenderer";
import { SheetWrapper } from "@/components/workflow/editor/SheetWrapper";
import { Node } from "reactflow";
import { Cpu, Hash } from "lucide-react";

interface NodeInspectorSheetProps {
    node: Node | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function NodeInspectorSheet({ node, open, onOpenChange }: NodeInspectorSheetProps) {
    const { workflowEditorDispatch, nodeCatalog } = useWorkflowEditor();
    const lastSyncedId = useRef<string | null>(null);
    const isHydrating = useRef(false);

    const nodeDef = useMemo(() =>
            nodeCatalog.find(n => n.type === node?.type),
        [node, nodeCatalog]);

    const { values, updateValue, setValues } = useNodeConfigState({
        initialValues: node?.data || {},
        onChange: (newConfig) => {
            if (isHydrating.current || !node) return;

            console.log("Current Node Config: ", node?.data);
            console.log("Config form Schema Builder: ", newConfig);
            workflowEditorDispatch({
                type: WorkflowEditorActionType.UPDATE_NODE,
                id: node.id,
                payload: newConfig
            });
        }
    });

    useEffect(() => {
        if (!node || node.id === lastSyncedId.current) return;

        const incomingConfig = node.data || {};

        isHydrating.current = true;
        setValues(incomingConfig);
        lastSyncedId.current = node.id;

        const timer = setTimeout(() => {
            isHydrating.current = false;
        }, 0);

        return () => clearTimeout(timer);
    }, [node?.id, setValues]);

    if (!node) return null;

    return (
        <SheetWrapper
            title={node?.data?.meta?.label}
            open={open}
            onOpenChange={onOpenChange}
            className="w-[480px] border-l border-white/[0.06] bg-[#0A0A0A]/98 p-0! backdrop-blur-xl"
        >
            <div className="flex h-full flex-col">
                <ScrollArea className="flex-1">
                    <div className="p-2 pb-28">
                        <NodeConfigRenderer
                            schema={nodeDef.schema}
                            values={values}
                            onChange={updateValue}
                        />
                    </div>
                </ScrollArea>

                <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#050505]/80 border-t border-white/[0.04] backdrop-blur-md">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Hash size={10} className="text-neutral-700" />
                            <span className="text-[9px] font-mono text-neutral-600 uppercase tracking-wider">
                                ID: {node?.id.slice(0, 12)}...
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Cpu size={9} className="text-neutral-700" />
                            <span className="text-[9px] font-semibold text-neutral-500 uppercase tracking-wider">
                                {node?.type}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </SheetWrapper>
    );
}