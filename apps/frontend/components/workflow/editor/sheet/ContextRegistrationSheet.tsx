"use client";

import React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ChevronDown, Share2, AlertCircle } from "lucide-react";
import { useWorkflowEditor } from "@/hooks/workflow/useWorkflowEditor";
import {WorkflowEditorActionType} from "@/constants";
import {WorkflowNode} from "@neuron/shared";

export const ContextRegistrationSheet = ({ nodeId }: { nodeId: string }) => {
    const { editorState, workflowEditorDispatch } = useWorkflowEditor();

    // Get nodes from the single source of truth
    const nodes = editorState.graph.nodes;
    const currentNode = nodes.find((n) => n.id === nodeId);
    const contextNode: WorkflowNode = nodes.find((n) => n.type === 'contextNode');

    if (!currentNode) return null;

    const config: any = currentNode.config || {};

    const handleToggle = (checked: boolean) => {
        // 1. Update the Current Node's persistence settings
        workflowEditorDispatch({
            type: WorkflowEditorActionType.UPDATE_NODE,
            id: nodeId,
            payload: {
                ...config,
                persistToContext: checked,
                contextNodeId: checked ? contextNode?.id : undefined
            }
        });

        // 2. Cross-Node Update: Register output in the ContextNode
        if (checked && contextNode) {
            const aliasKey = config.alias || nodeId;

            workflowEditorDispatch({
                type: WorkflowEditorActionType.UPDATE_NODE,
                id: contextNode.id,
                payload: {
                    ...contextNode.config,
                    fields: {
                        ...contextNode.config.fields,
                        [nodeId]: `{{${nodeId}}}`
                    }
                }
            });
        }
    };

    const handleAliasChange = (newAlias: string) => {
        const oldAlias = config.alias || nodeId;

        // Update the current node's alias
        workflowEditorDispatch({
            type: WorkflowEditorActionType.UPDATE_NODE,
            id: nodeId,
            payload: { ...config, alias: newAlias }
        });

        // Sync the change to the ContextNode if active
        if (config.persistToContext && contextNode) {
            const newFields = { ...contextNode.config.fields };
            delete newFields[oldAlias]; // Remove old key
            newFields[newAlias || nodeId] = `{{${nodeId}.output}}`;

            workflowEditorDispatch({
                type: WorkflowEditorActionType.UPDATE_NODE,
                id: contextNode.id,
                payload: {
                    ...contextNode.config,
                    fields: newFields
                }
            });
        }
    };

    return (
        <Collapsible className="w-full border border-neutral-800 rounded-lg p-3 bg-neutral-950/50">
            <CollapsibleTrigger className="flex items-center justify-between w-full group">
                <div className="flex items-center gap-2 text-sm font-medium text-neutral-300">
                    <Share2 className="w-4 h-4 text-blue-500" />
                    <span>Context Integration</span>
                </div>
                <ChevronDown className="w-4 h-4 text-neutral-500 transition-transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>

            <CollapsibleContent className="pt-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="persist" className="text-neutral-200 text-xs cursor-pointer">
                            Expose to Context
                        </Label>
                        {!contextNode && (
                            <p className="text-[10px] text-amber-500/80 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> No Context Node found
                            </p>
                        )}
                    </div>
                    <Switch
                        id="persist"
                        checked={config.persistToContext || false}
                        onCheckedChange={handleToggle}
                        disabled={!contextNode}
                    />
                </div>

                {config.persistToContext && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                        <Label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tight">
                            Variable Name (Alias)
                        </Label>
                        <Input
                            placeholder="e.g. news_article"
                            value={config.alias || ""}
                            onChange={(e) => handleAliasChange(e.target.value)}
                            className="h-8 text-xs bg-neutral-900 border-neutral-800 text-neutral-100 focus:border-blue-500/50"
                        />
                        <p className="text-[10px] text-neutral-500 italic">
                            Used as: <span className="text-blue-400 font-mono">{"{{"}{config.alias || nodeId}{"}}"}</span>
                        </p>
                    </div>
                )}
            </CollapsibleContent>
        </Collapsible>
    );
};