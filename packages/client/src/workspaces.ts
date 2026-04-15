import {authorizedFetch, safeTask} from '@neuron/shared';

const URL = process.env.NEXT_PUBLIC_API_ENDPOINT!;

export const workspaces = {
    list: (token: string) =>
        safeTask(() => authorizedFetch(`${URL}/workspaces`, { method: 'GET' }, token)),

    create: (data: { name: string; description?: string }, token: string) =>
        safeTask(() => authorizedFetch(`${URL}/workspaces`, {
            method: 'POST',
            body: JSON.stringify(data)
        }, token)),

    update: (id: string, data: { name?: string; description?: string }, token: string) =>
        safeTask(() => authorizedFetch(`${URL}/workspaces/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        }, token)),

    delete: (id: string, token: string) =>
        safeTask(() => authorizedFetch(`${URL}/workspaces/${id}`, { method: 'DELETE' }, token)),

    /** Drag & Drop assignment */
    assignWorkflow: (payload: { workflowId: string; workspaceId: string | null }, token: string) =>
        safeTask(() => authorizedFetch(`${URL}/workspaces/assign-workflow`, {
            method: 'POST',
            body: JSON.stringify(payload)
        }, token)),
};