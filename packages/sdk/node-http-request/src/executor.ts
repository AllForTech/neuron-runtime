import { NodeExecutor, NodeExecutorContext, ExecutorOutput } from "@neuron/shared";
import { HttpNodeConfig } from "./index.js";

export const executor: NodeExecutor = async ({
                                                 config,
                                             }: NodeExecutorContext): Promise<ExecutorOutput> => {
    const { url, method, headers = {}, body } = config as HttpNodeConfig;

    const finalBody = typeof body === 'object' ? JSON.stringify(body) : body;

    const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...headers },
        body: method !== "GET" ? finalBody : undefined
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