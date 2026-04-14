'use client';

import React, {useCallback, useMemo} from 'react';
import { useWorkspaces } from '@/hooks/workspace/useWorkspace';
import { WorkflowCard } from '../WorkflowCard';
import { LayoutGrid, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {useWorkflows} from "@/hooks/workflow/useWorkflows";

interface WorkspaceDetailViewProps {
    workspaceId: string;
}

export const WorkspaceDetailView = ({
                                        workspaceId,
                                    }: WorkspaceDetailViewProps) => {
    const { workspaces, isLoading } = useWorkspaces();
    const { deleteWorkflow } = useWorkflows();
    const router = useRouter();

    // Select the specific workspace from the Record
    const workspace = useMemo(() => workspaces[workspaceId], [workspaces, workspaceId]);

    const handleClick = useCallback(async (id: string): Promise<void> => {
        router.push(`/editor/${id}`)
    }, [workspaceId]);

    if (isLoading) {
        return <div className="p-8 text-neutral-500 animate-pulse">Loading workspace...</div>;
    }

    if (!workspace) {
        return (
            <div className="flex flex-col items-center justify-center p-20 border border-dashed border-white/5 rounded-2xl">
                <p className="text-neutral-500 mb-4">Workspace not found.</p>
                <Button variant="ghost" onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    const workflows = Object.values(workspace.workflows);

    return (
        <div className="flex flex-col gap-8 py-6">
            {/* --- Minimalist Header --- */}
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors cursor-pointer mb-2" onClick={() => router.back()}>
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Back to Overview</span>
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight text-white capitalize">
                        {workspace.name}
                    </h1>
                    <p className="text-sm text-neutral-500 max-w-2xl">
                        {workspace.description || `Managing ${workflows.length} automated workflows in this space.`}
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-neutral-900/50 p-1 rounded-lg border border-white/5">
                    <div className="px-3 py-1.5 flex items-center gap-2">
                        <LayoutGrid className="h-4 w-4 text-neutral-400" />
                        <span className="text-xs font-medium text-neutral-300">{workflows.length} Projects</span>
                    </div>
                </div>
            </header>

            {/* --- Project Grid --- */}
            {workflows.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {workflows.map((wf) => (
                        <WorkflowCard
                            key={wf.id}
                            workflow={wf}
                            deleteAction={deleteWorkflow}
                            clickAction={handleClick}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 rounded-2xl bg-muted/20 border border-dashed border-white/5">
                    <p className="text-sm text-neutral-600">This workspace is currently empty.</p>
                    <p className="text-xs text-neutral-700 mt-1">Drag and drop workflows here from the main dashboard.</p>
                </div>
            )}
        </div>
    );
};