import {NodeExecutor, NodeExecutorContext, ExecutorOutput, transformToObject} from "@neuron/shared";
import { HttpNodeConfig } from "./index.js";

export const httpNodeExecutor: NodeExecutor = async ({
                                                 config,
                                             }: NodeExecutorContext): Promise<ExecutorOutput> => {
    const { url, method, headers, body } = config as HttpNodeConfig;

    const formattedHeaders = transformToObject(headers, { isHeader: true });

    const formattedBody = method !== "GET"
        ? transformToObject(body, { stringify: true })
        : undefined;

    const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...formattedHeaders },
        body: formattedBody,
    } as any);

    if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();

    return {
        success: true,
        output: data,
    };
}