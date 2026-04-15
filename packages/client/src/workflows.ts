import { authorizedFetch } from '@neuron/auth';
import { safeTask } from '@neuron/shared/utils';
import type {
    WorkflowNode,
    WorkflowEdge,
    GlobalVariable,
    WorkflowDefinition
} from '@neuron/shared';

const URL = process.env.NEXT_PUBLIC_API_ENDPOINT!;

export const workflows = {
    /** Get all workflows */
    list: (token: string) =>
        safeTask(() => authorizedFetch<WorkflowDefinition[]>(`${URL}/workflows`, { method: 'GET' }, token)),

    /** Create a new workflow */
    create: (data: any, token: string) =>
        safeTask(() => authorizedFetch(`${URL}/workflows`, {
            method: 'POST',
            body: JSON.stringify(data)
        }, token)),

    /** Get specific graph nodes and edges */
    getGraph: (workflowId: string, token: string) =>
        safeTask(() => authorizedFetch<{ nodes: WorkflowNode[]; edges: WorkflowEdge[] }>(
            `${URL}/workflows/${workflowId}/graph`, { method: 'GET' }, token
        )),

    /** Save graph and variables */
    saveGraph: (workflowId: string, token: string, payload: {
        graph: { nodes: WorkflowNode[]; edges: WorkflowEdge[] };
        globalVariables: GlobalVariable[];
    }) =>
        safeTask(() => authorizedFetch(`${URL}/workflows/${workflowId}/graph`, {
            method: 'POST',
            body: JSON.stringify(payload)
        }, token)),

    /** Deploy a workflow */
    deploy: (workflowId: string, data: any, token: string) =>
        safeTask(() => authorizedFetch(`${URL}/workflows/deploy/${workflowId}`, {
            method: 'POST',
            body: JSON.stringify(data)
        }, token)),

    /** Run/Execute a workflow */
    run: (runId: string, token: string) =>
        safeTask(() => authorizedFetch(`${URL}/workflows/execute/${runId}`, { method: 'GET' }, token)),
};