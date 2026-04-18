'use client';

import {
    createContext,
    ReactNode,
    useCallback,
    useEffect,
    useReducer,
    useState,
} from 'react';
import type { NewWorkflow as NewWorkflowType, Workflow as WorkflowType } from '@neuron/db';
import { NewWorkflowGeneralType, WorkflowAction } from '@/types/workflow';
import { WorkflowActionType } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import { toWorkflowTableSchema } from '@/lib/utils';
import { workflows as workflowClient } from "@neuron/client";

export const CreateWorkflowTabs = {
    general: 'General',
    execution: 'Execution',
    runtime: 'Runtime',
    advanceSetting: 'AdvanceSetting',
};

type WorkflowContextType = {
    workflows: WorkflowType[];
    workflowsDispatcher: (action: WorkflowAction) => void;
    newWorkflow: INewWorkflow;
    setNewWorkflow: (prev: any) => void;
    isWorkflowLoading: boolean;
    workflowErrors: string | null;
    refetch: () => Promise<void>;
    createWorkflow: () => Promise<void>;
    deleteWorkflow: (id: string) => Promise<void>;
    AddNewWorkflow: (newWorkflow: WorkflowType) => Promise<void>;
};

interface INewWorkflow {
    general: NewWorkflowGeneralType;
}

export const WorkflowContext = createContext<WorkflowContextType | undefined>(
    undefined
);

export function WorkflowProvider({ children }: { children: ReactNode }) {
    const { user, session } = useAuth();

    const [workflows, workflowsDispatcher] = useReducer(
        workflowsReducer,
        [] as WorkflowType[]
    );

    const [newWorkflow, setNewWorkflow] = useState<INewWorkflow>({
        general: {
            name: '',
            description: '',
            category: '',
            template: 'gpt-4o',
        },
    });

    const [isWorkflowLoading, setIsWorkflowLoading] = useState(true);
    const [workflowErrors, setWorkflowErrors] = useState<string | null>(null);

    function workflowsReducer(
        state: WorkflowType[],
        action: WorkflowAction
    ): WorkflowType[] {
        switch (action.type) {
            case WorkflowActionType.SET_WORKFLOWS:
                return action.payload;
            case WorkflowActionType.ADD_WORKFLOW:
                return [action.payload, ...state];
            case WorkflowActionType.UPDATE_WORKFLOW:
                return state.map((w) =>
                    w.id === action.id ? { ...w, ...action.payload } : w
                );
            case WorkflowActionType.DELETE_WORKFLOW:
                return state.filter((w) => w.id !== action.id);
            case WorkflowActionType.UPDATE_STATUS:
                return state.map((w) =>
                    w.id === action.id ? { ...w, status: action.status } : w
                );
            default:
                return state;
        }
    }

    /** Syncs all workflows belonging to the authenticated user */
    const fetchWorkflows = useCallback(async () => {
        if (!session?.access_token) return;

        try {
            setIsWorkflowLoading(true);
            const [data, error] = await workflowClient.list(session.access_token);

            if (error) throw error;

            workflowsDispatcher({
                type: WorkflowActionType.SET_WORKFLOWS,
                payload: data as unknown as WorkflowType[],
            });
        } catch (err: any) {
            setWorkflowErrors(err.message);
        } finally {
            setIsWorkflowLoading(false);
        }
    }, [session?.access_token]);

    /** Initializes a new workflow draft in the database */
    const createWorkflow = async () => {
        if (!session?.access_token || !user) return;

        try {
            const data: NewWorkflowType = {
                name: newWorkflow.general.name,
                description: newWorkflow.general.description,
                userId: user.id,
                status: 'active',
                isActive: false,
                runs: 0,
            };

            const convertedData = toWorkflowTableSchema(data);
            const [res, error] = await workflowClient.create(convertedData, session.access_token);

            if (error) throw error;

            console.log('Workflow created:', res);
        } catch (err: any) {
            console.error(err.message);
        }
    };

    /** Updates the local state with a newly created workflow */
    const AddNewWorkflow = async (newWorkflow: WorkflowType) => {
        workflowsDispatcher({
            type: WorkflowActionType.ADD_WORKFLOW,
            payload: newWorkflow,
        });
    };

    /** Removes a workflow from both the database and local state */
    const deleteWorkflow = async (id: string) => {
        if (!session?.access_token) return;

        try {
            const [_, error] = await workflowClient.delete(id, session.access_token);

            if (error) throw error;

            workflowsDispatcher({
                type: WorkflowActionType.DELETE_WORKFLOW,
                id,
            });
        } catch (err: any) {
            console.error(err.message);
        }
    };

    useEffect(() => {
        if (session?.access_token) fetchWorkflows();
    }, [session?.access_token, fetchWorkflows]);

    return (
        <WorkflowContext.Provider
            value={{
                workflows,
                workflowsDispatcher,
                newWorkflow,
                setNewWorkflow,
                isWorkflowLoading,
                workflowErrors,
                refetch: fetchWorkflows,
                createWorkflow,
                deleteWorkflow,
                AddNewWorkflow,
            }}
        >
            {children}
        </WorkflowContext.Provider>
    );
}