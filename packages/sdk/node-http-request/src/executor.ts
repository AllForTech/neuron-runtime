import {NodeExecutorContext} from "@neuron/shared";
import {HttpNodeConfig} from "./index";

export const executor = async ({
    nodeType,
    config,
    input,
                               }: NodeExecutorContext) => {
    const { url, method, headers = {}, body } = config as HttpNodeConfig;

    // Ensure the body is a valid string if it was resolved from an object
    const finalBody = typeof body === 'object' ? JSON.stringify(body) : body;

    const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...headers },
        body: method !== "GET" ? finalBody : undefined
    } as any);

    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
}