'use client';

import React, { useState } from 'react';
import {
    MoreHorizontal,
    Trash2, Key,
    Check, Copy,
} from 'lucide-react';
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { cn, getBackendEndpoint } from '@/lib/utils';
import {DeployedWorkflow} from "@neuron/db";

/**
 * Renders a single deployment record in the History tab.
 */
export function DeploymentHistoryItem({ deployment, onDelete }: { deployment: DeployedWorkflow, onDelete: (id: string) => void }) {
    const [copied, setCopied] = useState(false);
    const endpoint = `${getBackendEndpoint()}/execute/workflow/${deployment.id}`;

    const copyUrl = () => {
        navigator.clipboard.writeText(endpoint);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AccordionItem value={deployment.id} className="border-white/[0.04] bg-white/[0.01] rounded-xl px-4 mb-2">
            <div className="flex items-center justify-between w-full py-4">
                <div className="flex items-center gap-4 flex-1">
                    <div className={cn(
                        "w-2 h-2 rounded-full animate-pulse",
                        deployment.isActive ? "bg-emerald-500" : "bg-neutral-600"
                    )} />
                    <div className="flex flex-col">
            <span className="text-[11px] font-bold text-white tracking-tight uppercase">
              {deployment.name || 'Untitled Instance'}
            </span>
                        <span className="text-[9px] font-mono text-neutral-500">
              ID: {deployment.id.split('-')[0]}...
            </span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <Badge variant="outline" className="text-[9px] border-white/10 bg-black/40 text-neutral-400">
                        {deployment.private ? 'PRIVATE' : 'PUBLIC'}
                    </Badge>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-neutral-500 hover:text-white">
                                <MoreHorizontal size={14} />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#0D0D0D] border-white/10 w-48">
                            <DropdownMenuItem onClick={copyUrl} className="text-xs gap-2 py-2 cursor-pointer">
                                <Copy size={12} /> Copy Endpoint
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs gap-2 py-2 cursor-pointer">
                                <Key size={12} /> Rotate API Key
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/5" />
                            <DropdownMenuItem
                                onClick={() => onDelete(deployment.id)}
                                className="text-xs gap-2 py-2 text-red-500 hover:text-red-400 cursor-pointer"
                            >
                                <Trash2 size={12} /> Decommission
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <AccordionTrigger className="p-0 hover:no-underline" />
                </div>
            </div>

            <AccordionContent className="pb-6 border-t border-white/[0.04] pt-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                        <span className="text-[9px] text-neutral-600 uppercase font-black">Endpoint</span>
                        <div className="flex items-center gap-2 bg-black/40 p-2 rounded-lg border border-white/5">
                            <span className="text-[10px] font-mono text-emerald-500 truncate flex-1">{endpoint}</span>
                            <button onClick={copyUrl} className="text-neutral-500 hover:text-white">
                                {copied ? <Check size={10} /> : <Copy size={10} />}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[9px] text-neutral-600 uppercase font-black">Created At</span>
                        <p className="text-[10px] text-neutral-400 pt-2 font-mono">
                            {new Date(deployment.createdAt).toLocaleString()}
                        </p>
                    </div>
                </div>
                <div className="bg-neutral-900/40 p-3 rounded-lg border border-white/[0.02]">
                    <span className="text-[9px] text-neutral-600 uppercase font-black block mb-2">Metadata</span>
                    <div className="flex gap-4">
                        <div className="text-[10px] text-neutral-500 font-mono">Nodes: {JSON.stringify(deployment.nodes).length} bytes</div>
                        <div className="text-[10px] text-neutral-500 font-mono">Edges: {JSON.stringify(deployment.edges).length} bytes</div>
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}