'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
    getWorkspacesRequest,
    createWorkspaceRequest,
    deleteWorkspaceRequest,
    assignWorkflowToWorkspaceRequest
} from '@/lib/api-client/workspace.client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Workspace {
    id: string;
    name: string;
    description?: string;
    workflows: Record<string, any>; // Nested Record for O(1) workflow access
}

type WorkspaceRecord = Record<string, Workspace>;

interface WorkspaceContextType {
    workspaces: WorkspaceRecord; // Single source of truth
    isLoading: boolean;
    refreshWorkspaces: () => Promise<void>;
    createWorkspace: (name: string, description?: string) => Promise<void>;
    deleteWorkspace: (id: string) => Promise<void>;
    assignWorkflow: (workflowId: string, workspaceId: string | null, workflow?: any) => Promise<void>;
    setWorkflowInWorkspace: (workflowId: string, workspaceId: string | null, workflow?: any) => void;
}

export const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider = ({ children }: { children: React.ReactNode }) => {
    const [workspaces, setWorkspaces] = useState<WorkspaceRecord>({});
    const [isLoading, setIsLoading] = useState(true);
    const { user, session } = useAuth();

    const token = session?.access_token;

    const loadWorkspaces = useCallback(async () => {
        if (!token) return;

        setIsLoading(true);
        try {
            const response = await getWorkspacesRequest(token);
            if (response?.data) {
                const record = response.data.reduce((acc: WorkspaceRecord, ws: any) => {
                    // Transform nested workflows array to record
                    const workflowRecord = (ws.workflows || []).reduce((wAcc: Record<string, any>, wf: any) => {
                        wAcc[wf.id] = wf;
                        return wAcc;
                    }, {});

                    acc[ws.id] = { ...ws, workflows: workflowRecord };
                    return acc;
                }, {});

                setWorkspaces(record);
            }
        } catch (error) {
            console.error('Error fetching workspaces:', error);
            toast.error('Failed to load workspaces');
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    const createWorkspace = useCallback(async (name: string, description?: string) => {
        if (!token) return;

        const nameExists = Object.values(workspaces).some(
            ws => ws.name.toLowerCase() === name.toLowerCase()
        );

        if (nameExists) {
            toast.error(`Workspace "${name}" already exists`);
            return;
        }

        const response = await createWorkspaceRequest({ name, description }, token);
        if (response) {
            toast.success('Workspace created');
            setWorkspaces(prev => ({
                ...prev,
                [response.id]: { ...response, workflows: {} }
            }));
        }
    }, [token, workspaces]);

    const removeWorkspace = useCallback(async (id: string) => {
        if (!token) return;
        const response = await deleteWorkspaceRequest(id, token);

        if (response) {
            toast.success('Workspace removed');
            setWorkspaces(prev => {
                const next = { ...prev };
                delete next[id];
                return next;
            });
        }
    }, [token]);

    const setWorkflowInWorkspace = useCallback((
        workflowId: string,
        workspaceId: string | null,
        workflow?: any
    ) => {
        setWorkspaces(prev => {
            const next = { ...prev };
            let targetWorkflow = workflow;

            // Step A: Remove from any existing workspace and capture the object if not provided
            Object.keys(next).forEach(id => {
                if (next[id].workflows[workflowId]) {
                    if (!targetWorkflow) targetWorkflow = next[id].workflows[workflowId];

                    const newWorkflows = { ...next[id].workflows };
                    delete newWorkflows[workflowId];
                    next[id] = { ...next[id], workflows: newWorkflows };
                }
            });

            // Step B: Add to the new workspace (if target is a workspace and we have the workflow data)
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
        workflow?: any
    ) => {
        if (!token) return;

        const previousState = { ...workspaces };

        // 1. Optimistic Update using our extracted logic
        setWorkflowInWorkspace(workflowId, workspaceId, workflow);

        try {
            const response = await assignWorkflowToWorkspaceRequest({ workflowId, workspaceId }, token);
            if (!response) {

            }
        } catch (error) {
            setWorkspaces(previousState);
            toast.error('Failed to reassign workflow');
        }
    }, [token, workspaces, setWorkflowInWorkspace]);


    useEffect(() => {
        if (user && token) loadWorkspaces();
    }, [loadWorkspaces, user, token]);

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