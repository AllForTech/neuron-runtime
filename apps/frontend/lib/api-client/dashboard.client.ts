// lib/api-client/executions.ts

import { authorizedFetch } from "./authorizeFetch";

const URL = process.env.NEXT_PUBLIC_API_ENDPOINT!;

export async function getExecutionsRequest(token: string) {
    return authorizedFetch(`${URL}/executions`, {}, token);
}

export async function getExecutionMetricsRequest(token: string) {
    return authorizedFetch(`${URL}/executions/metrics`, {}, token);
}

export async function getRecentExecutionsRequest(token: string, limit = 20) {
    return authorizedFetch(
        `${URL}/executions/recent?limit=${limit}`,
        {},
        token
    );
}