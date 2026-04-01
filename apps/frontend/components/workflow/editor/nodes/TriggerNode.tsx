'use client';

import { NodeProps, Position } from "reactflow";
import { Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ContextMenuItem } from "@/components/ui/context-menu";
import { NodeHandle } from "./NodeHandle";

import { cn, getNodeStatusStyles, nodePropsToReactflowNode } from "@/lib/utils";
import { useWorkflowEditor } from "@/hooks/workflow/useWorkflowEditor";
import { WorkflowEditorActionType } from "@/constants";
import { ContextMenuWrapper } from "@/components/workflow/editor/ContextMenuWrapper";
import { NodeStatusIndicator } from "@/components/workflow/editor/nodes/NodeStatusIndicator";
import { DynamicNodeToolbar } from "@/components/workflow/editor/nodes/toolbar/DynamicNodeToolbar";

export default function TriggerNode(node: NodeProps) {
    const { id, selected, data } = node;

    const {
        editorState,
        workflowEditorDispatch,
        setSheetOpen,
        selectedNode,
        setSelectedNode,
    } = useWorkflowEditor();

    const status = editorState.runtime?.nodeStatus?.[id] ?? "idle";
    const statusClass = getNodeStatusStyles(status);

    const handleMenuClick = (action: string) => {
        switch (action) {
            case "delete":
                workflowEditorDispatch({ type: WorkflowEditorActionType.DELETE_NODE, id });
                break;
            case "edit":
                setSelectedNode(nodePropsToReactflowNode(node));
                setSheetOpen(true);
                break;
        }
    };

    return (
        <ContextMenuWrapper
            trigger={
                <Card
                    onContextMenu={(e) => e.stopPropagation()}
                    className={cn(
                        "group flex flex-col items-center justify-center w-32 h-32 transition-all p-4 rounded-full border-1 border-neutral-800 relative",
                        "bg-gradient-to-b from-neutral-200/10 via-neutral-500/5 to-transparent backdrop-blur-xl",
                        !selectedNode && statusClass,
                        selected && "ring-2! ring-primary!"
                    )}
                >
                    {/* Toolbar */}
                    <DynamicNodeToolbar
                        nodeId={id}
                        nodeType="trigger"
                        config={data}
                        isVisible={selected}
                        onSettingsClick={() => {
                            setSelectedNode(nodePropsToReactflowNode(node));
                            setSheetOpen(true);
                        }}
                    />

                    {/* Source Handle Only */}
                    <NodeHandle
                        className="-right-[35px]! bg-neutral-400 border-2 border-neutral-950"
                        node={node}
                        type="source"
                        position={Position.Right}
                    />

                    {/* Logic & Layout: Nested Cards but Circular */}
                    <Card
                        className={cn(
                            "flex flex-col items-center justify-center rounded-full border-0 w-full h-full transition p-0",
                            "bg-neutral-900/70 group-hover:bg-neutral-800"
                        )}
                    >
                        <CardContent className="p-0 flex flex-col items-center justify-center gap-1">
                            {/* Icon Layer */}
                            <Zap size={24} className="text-amber-500 fill-amber-500/10 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]" />

                            {/* Status Layer */}
                            <div className="flex flex-col items-center gap-1.5">
                                <span className="text-[8px] uppercase font-bold tracking-[0.2em] text-neutral-500">
                                    {status}
                                </span>
                                <NodeStatusIndicator status={status} />
                            </div>
                        </CardContent>
                    </Card>

                    {/*/!* Bottom Label Layer (Nested Card style) *!/*/}
                    {/*<Card*/}
                    {/*    className={cn(*/}
                    {/*        "absolute bottom-0 left-0 right-0 h-1/3 flex items-center justify-center border-0 rounded-none transition bg-neutral-900/40",*/}
                    {/*        "group-hover:bg-neutral-800/60"*/}
                    {/*    )}*/}
                    {/*>*/}
                    {/*    <CardContent className="p-0">*/}
                    {/*        <span className="text-[9px] text-neutral-300 font-medium tracking-tighter">*/}
                    {/*            {data?.label || "ORIGIN"}*/}
                    {/*        </span>*/}
                    {/*    </CardContent>*/}
                    {/*</Card>*/}
                </Card>
            }
        >
            <ContextMenuItem onClick={() => handleMenuClick("edit")}>
                Edit Configuration
            </ContextMenuItem>

            <ContextMenuItem
                className="text-red-500 cursor-pointer"
                onClick={() => handleMenuClick("delete")}
            >
                Delete Node
            </ContextMenuItem>
        </ContextMenuWrapper>
    );
}