'use client';

import React, { createContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useWorkflows } from "@/hooks/workflow/useWorkflows";
import { WorkflowActionType } from "@/constants";
import { Workflow as WorkflowType } from "@neuron/db";
import { workspaces as workspaceClient, workflows as workflowClient } from "@neuron/client";

interface Workspace {
    id: string;
    name: string;
    description?: string;
    workflows: Record<string, WorkflowType>;
    createdAt: Date;
}

type WorkspaceRecord = Record<string, Workspace>;

interface WorkspaceContextType {
    workspaces: WorkspaceRecord;
    isLoading: boolean;
    refreshWorkspaces: () => Promise<void>;
    createWorkspace: (name: string, description?: string) => Promise<void>;
    deleteWorkspace: (id: string) => Promise<void>;
    assignWorkflow: (workflowId: string, workspaceId: string | null, workflow: WorkflowType) => Promise<void>;
    setWorkflowInWorkspace: (workflowId: string, workspaceId: string | null, workflow: WorkflowType) => void;
}

export const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider = ({ children }: { children: React.ReactNode }) => {
    const [workspaces, setWorkspaces] = useState<WorkspaceRecord>({});
    const { workflowsDispatcher } = useWorkflows();
    const [isLoading, setIsLoading] = useState(false);
    const { user, session } = useAuth();

    const token = session?.access_token;

    const loadWorkspaces = useCallback(async () => {
        if (!token) return;

        setIsLoading(true);

        const [
            [wsData, wsError],
            [wfData, wfError]
        ]: any = await Promise.all([
            workspaceClient.list(token),
            workflowClient.list(token)
        ]);

        if (wfError || wsError) {
            toast.error('Failed to synchronize data');
            setIsLoading(false);
            return;
        }

        if (wfData.success) {
            workflowsDispatcher({
                type: WorkflowActionType.SET_WORKFLOWS,
                payload: wfData.data as WorkflowType[],
            });
        }

        if (wsData) {
            const record = (wsData as any[]).reduce((acc: WorkspaceRecord, ws: any) => {
                const workflowRecord = (ws.workflows || []).reduce((wAcc: Record<string, any>, wf: any) => {
                    wAcc[wf.id] = wf;
                    return wAcc;
                }, {});

                acc[ws.id] = { ...ws, workflows: workflowRecord };
                return acc;
            }, {});

            setWorkspaces(record);
        }

        setIsLoading(false);
    }, [token, workflowsDispatcher]);

    const createWorkspace = useCallback(async (name: string, description?: string) => {
        if (!token) return;

        const nameExists = Object.values(workspaces).some(
            ws => ws.name.toLowerCase() === name.toLowerCase()
        );

        if (nameExists) {
            toast.error(`Workspace "${name}" already exists`);
            return;
        }

        const [data, error] = await workspaceClient.create({ name, description }, token);

        if (error) {
            toast.error(error.message);
            return;
        }

        if (data) {
            toast.success('Workspace created');
            setWorkspaces(prev => ({
                ...prev,
                [(data as any).id]: { ...(data as any), workflows: {} }
            }));
        }
    }, [token, workspaces]);

    const removeWorkspace = useCallback(async (id: string) => {
        if (!token) return;

        const [data, error] = await workspaceClient.delete(id, token);

        if (error) {
            toast.error(error.message);
            return;
        }

        toast.success((data as any)?.message ?? 'Workspace removed');
        setWorkspaces(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    }, [token]);

    const setWorkflowInWorkspace = useCallback((
        workflowId: string,
        workspaceId: string | null,
        workflow: WorkflowType
    ) => {
        setWorkspaces(prev => {
            const next = { ...prev };
            let targetWorkflow = workflow;

            Object.keys(next).forEach(id => {
                if (next[id].workflows[workflowId]) {
                    if (!targetWorkflow) targetWorkflow = next[id].workflows[workflowId];

                    const newWorkflows = { ...next[id].workflows };
                    delete newWorkflows[workflowId];
                    next[id] = { ...next[id], workflows: newWorkflows };
                }
            });

            if (workspaceId && next[workspaceId] && targetWorkflow) {
                next[workspaceId] = {
                    ...next[workspaceId],
                    workflows: {
                        [workflowId]: targetWorkflow,
                        ...next[workspaceId].workflows
                    }
                };
            }

            return next;
        });
    }, []);

    const assignWorkflow = useCallback(async (
        workflowId: string,
        workspaceId: string | null,
        workflow: WorkflowType
    ) => {
        if (!token) return;

        const previousState = { ...workspaces };

        setWorkflowInWorkspace(workflowId, workspaceId, workflow);

        const [_, error] = await workspaceClient.assignWorkflow({ workflowId, workspaceId }, token);

        if (error) {
            setWorkspaces(previousState);
            toast.error('Failed to reassign workflow');
        }
    }, [token, workspaces, setWorkflowInWorkspace]);

    useEffect(() => {
        if (user && token) loadWorkspaces();
    }, [token, user, loadWorkspaces]);

    const value = useMemo(() => ({
        workspaces,
        isLoading,
        refreshWorkspaces: loadWorkspaces,
        createWorkspace,
        deleteWorkspace: removeWorkspace,
        assignWorkflow,
        setWorkflowInWorkspace,
    }), [
        workspaces,
        isLoading,
        loadWorkspaces,
        createWorkspace,
        removeWorkspace,
        assignWorkflow,
        setWorkflowInWorkspace]);

    return (
        <WorkspaceContext.Provider value={value}>
            {children}
        </WorkspaceContext.Provider>
    );
};