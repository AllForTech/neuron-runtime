import { authorizedFetch } from '@neuron/auth';
import { safeTask } from '@neuron/shared/utils';

const URL = process.env.NEXT_PUBLIC_API_ENDPOINT!;

export const executions = {
    listByWorkflow: (workflowId: string, token: string) =>
        safeTask(() => authorizedFetch(`${URL}/executions/workflow/${workflowId}`, { method: 'GET' }, token)),

    getLogs: (executionId: string, token: string) =>
        safeTask(() => authorizedFetch(`${URL}/executions/logs/${executionId}`, { method: 'GET' }, token)),

    getMetrics: (token: string) =>
        safeTask(() => authorizedFetch(`${URL}/executions/metrics`, { method: 'GET' }, token)),

    getRecent: (token: string, limit = 20) =>
        safeTask(() => authorizedFetch(`${URL}/executions/recent?limit=${limit}`, { method: 'GET' }, token)),
};