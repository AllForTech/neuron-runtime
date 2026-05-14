'use client';

import React from 'react';
import { useWorkflowEditor } from '@/hooks/workflow/useWorkflowEditor';
import { cn, getNodeColor, toReactFlowNode } from '@/lib/utils';
import { Cpu, Zap, Bug, ChevronRight, Layers } from 'lucide-react';
import { WorkflowNode } from '@neuron/shared';
import { useReactFlow } from 'reactflow';

const ICON_MAP: Record<string, React.ReactNode> = {
    trigger: <Zap className="h-3.5 w-3.5" />,
    httpNode: <Cpu className="h-3.5 w-3.5" />,
    debug: <Bug className="h-3.5 w-3.5" />,
};

export default function GraphNavigator() {
    const { setNodes } = useReactFlow();
    const {
        editorState,
        setSelectedNode,
        editorUIDispatch,
        fitNode,
    } = useWorkflowEditor();

    const nodes = editorState.graph.nodes;

    const handleNodeClick = (node: WorkflowNode) => {
        const rfNode = toReactFlowNode(node);

        // Select the node in React Flow
        setNodes((nds) =>
            nds.map((nd) => ({ ...nd, selected: nd.id === rfNode.id }))
        );

        // Center the view on the node
        fitNode(node);

        // Set as selected in our global state
        setSelectedNode(rfNode);

        // Automatically open the config panel on the right when clicking a layer
        editorUIDispatch({ type: 'OPEN_PANEL', panelId: 'node-config' });
    };

    return (
        <div className="flex flex-col h-full bg-transparent">
            {/* Header Info */}
            <div className="p-4 border-b border-white/[0.05]">
                <p className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase">
                    Active Layers — {Object.keys(nodes).length}
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-2.5 custom-scrollbar">
                {Object.entries(nodes).length < 1 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-30">
                        <Layers className="h-8 w-8 mb-3 stroke-[1]" />
                        <p className="text-[10px] font-bold tracking-widest uppercase">
                            Workspace Empty
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-1">
                        {Object.entries(nodes).map(([id, node]) => {
                            const color = getNodeColor(node.type);
                            const status = editorState.runtime?.nodeStatus?.[node.id] ?? 'idle';

                            return (
                                <button
                                    key={node.id}
                                    onClick={() => handleNodeClick(node)}
                                    className={cn(
                                        'group flex items-center bg-white/[0.03] gap-3 rounded-lg p-2.5 transition-all duration-200',
                                        'border border-transparent hover:border-white/5 hover:bg-white/[0.045]',
                                        'text-left outline-none'
                                    )}
                                >
                                    {/* Compact Icon */}
                                    <div className={cn(
                                        'flex h-8 w-8 items-center justify-center rounded-md border border-neutral-800 bg-neutral-900',
                                        color.text
                                    )}>
                                        {ICON_MAP[node.type] || <Cpu className="h-3.5 w-3.5" />}
                                    </div>

                                    {/* Metadata */}
                                    <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[11px] font-semibold text-neutral-300">
                        {node.config?.meta?.label || node.type}
                    </span>
                                        <div className="flex items-center gap-1.5">
                                            <div className={cn(
                                                "h-1 w-1 rounded-full",
                                                status === 'success' ? 'bg-emerald-500' :
                                                    status === 'error' ? 'bg-rose-500' :
                                                        status === 'running' ? 'bg-blue-500 animate-pulse' : 'bg-neutral-700'
                                            )} />
                                            <span className="text-[9px] font-bold tracking-tighter text-neutral-600 uppercase">
                        {status}
                        </span>
                                        </div>
                                    </div>

                                    <ChevronRight className="h-3 w-3 text-neutral-800 transition-transform group-hover:translate-x-0.5 group-hover:text-neutral-500" />
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}