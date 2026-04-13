'use client';

import React from 'react';
import { MoreVertical, Trash2, FolderInput } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkspaces } from '@/hooks/workspace/useWorkspace';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";

interface WorkflowActionsDropdownProps {
    workflow: any;
    onDelete: () => void;
    isDeleting?: boolean;
    triggerClassName?: string;
}

export const WorkflowActionsDropdown = ({
                                            workflow,
                                            onDelete,
                                            isDeleting,
                                            triggerClassName
                                        }: WorkflowActionsDropdownProps) => {
    const { workspaces, assignWorkflow } = useWorkspaces();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => e.stopPropagation()}
                    className={triggerClassName}
                >
                    <MoreVertical className="h-3.5 w-3.5 font-bold" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-white/5 bg-neutral-900 text-neutral-200">
                {/* --- Move to Workspace Submenu --- */}
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="flex gap-2 text-[12px] focus:bg-neutral-800">
                        <FolderInput className="h-3.5 w-3.5 text-neutral-400" />
                        <span>Move to Workspace</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="border-white/5 bg-neutral-900 min-w-[180px]">
                        <DropdownMenuItem
                            className="text-[12px] focus:bg-neutral-800"
                            onClick={() => assignWorkflow(workflow.id, null, workflow)}
                        >
                            General (No Workspace)
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/5" />
                        {Object.values(workspaces).map((ws) => (
                            <DropdownMenuItem
                                key={ws.id}
                                className="text-[12px] focus:bg-neutral-800"
                                onClick={() => assignWorkflow(workflow.id, ws.id, workflow)}
                            >
                                {ws.name}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator className="bg-white/5" />

                {/* --- Delete Action --- */}
                <DropdownMenuItem
                    disabled={isDeleting}
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onDelete();
                    }}
                    className="flex gap-2 text-[12px] text-red-400 focus:bg-red-400/10 focus:text-red-400"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Workflow</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};