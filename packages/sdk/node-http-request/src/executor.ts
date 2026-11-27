import {NodeExecutor, NodeExecutorContext, ExecutorOutput, transformToObject, logger} from "@neuron/shared";
import {fetch as undiciFetch, type RequestInit as UndiciRequestInit} from "undici";
import { HttpNodeConfig } from "./index.js";
import { resolvePublicHttpTarget, type PublicHttpTarget } from "./egress.js";
import { createPinnedDispatcher } from "./pinned-dispatcher.js";

const MAX_REDIRECTS = 5;

type FetchResponse = Awaited<ReturnType<typeof undiciFetch>>;
type PinnedResponse = { response: FetchResponse; release: () => Promise<void> };

function applyRedirectSemantics(status: number, init: UndiciRequestInit): UndiciRequestInit {
    if (status !== 301 && status !== 302 && status !== 303) return init;

    const method = (init.method ?? "GET").toUpperCase();
    return {
        ...init,
        method: method === "GET" || method === "HEAD" ? method : "GET",
        body: undefined,
    };
}

async function performPinnedFetch(target: PublicHttpTarget, init: UndiciRequestInit): Promise<PinnedResponse> {
    const dispatcher = createPinnedDispatcher(target.addresses);

    try {
        const response = await undiciFetch(target.url, { ...init, dispatcher });
        return { response, release: () => dispatcher.destroy() };
    } catch (error) {
        await dispatcher.destroy();
        throw error;
    }
}

async function fetchWithEgress(url: string, init: UndiciRequestInit): Promise<PinnedResponse> {
    let target = await resolvePublicHttpTarget(url);
    let requestInit: UndiciRequestInit = { ...init, redirect: "manual" };

    for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
        const pinned = await performPinnedFetch(target, requestInit);
        const location = pinned.response.headers.get("location");

        if (pinned.response.status >= 300 && pinned.response.status < 400 && location) {
            try {
                await pinned.response.body?.cancel();
                if (hop === MAX_REDIRECTS) {
                    throw new Error("HTTP node stopped after too many redirects");
                }
                target = await resolvePublicHttpTarget(new URL(location, target.url).toString());
                requestInit = applyRedirectSemantics(pinned.response.status, requestInit);
            } finally {
                await pinned.release();
            }
            continue;
        }

        return pinned;
    }

    throw new Error("HTTP node stopped after too many redirects");
}

export const httpNodeExecutor: NodeExecutor = async ({
    nodeType,
                                                   config,
                                               }: NodeExecutorContext): Promise<ExecutorOutput> => {
    const { url, method, headers, body } = config as HttpNodeConfig;


    logger.debug("Runtime Executor", `Config data from node type ${nodeType}`, {
        url,
        method,
        body,
        headers,
    })

    const formattedHeaders = transformToObject(headers, { isHeader: true });

    const formattedBody = method !== "GET"
        ? transformToObject(body, { stringify: true })
        : undefined;

    const { response: res, release } = await fetchWithEgress(url, {
        method,
        headers: { "Content-Type": "application/json", ...formattedHeaders },
        body: formattedBody,
    } as UndiciRequestInit);

    try {
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();

        return {
            success: true,
            output: data,
        };
    } finally {
        await release();
    }
}
