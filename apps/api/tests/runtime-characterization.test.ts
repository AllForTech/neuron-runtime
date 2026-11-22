import {beforeEach, describe, expect, it, vi} from "vitest";

const fakes = vi.hoisted(() => ({
    executors: {} as Record<string, (ctx: any) => Promise<{success: boolean; output: any}>>,
}));

vi.mock("@neuron/nodes/server", () => ({nodeExecutors: fakes.executors}));

import {Runtime} from "../../../packages/runtime/src/execution/runtime";

function config(extra: Record<string, any> = {}) {
    return {
        ...extra,
        executionConfig: {timeout: {enabled: true, durationMs: 1000}}
    };
}

function graph(type: string, nodeConfig: any) {
    return {nodes: [{id: "n1", type, config: nodeConfig}], edges: []};
}

describe("Runtime with injected ports", () => {
    beforeEach(() => {
        for (const key of Object.keys(fakes.executors)) delete fakes.executors[key];
    });

    it("resolves variables and secrets through the injected ports and emits domain events", async () => {
        const seen: any[] = [];
        fakes.executors["Trigger.Manual"] = async ({config: resolved}: any) => ({
            success: true,
            output: {greeting: resolved.greeting, secret: resolved.secret}
        });

        const variables = {
            getForWorkflow: vi.fn(async (_workflowId: string) => ({greeting: "hello"}))
        };
        const vault = {resolve: vi.fn(async (_key: string) => "s3cret")};
        const sink = {emit: vi.fn(async (event: any) => void seen.push(event))};

        const runtime = new Runtime({
            workflowId: "wf-1",
            userId: "u-1",
            executionId: "ex-1",
            graph: graph("Trigger.Manual", config({
                greeting: "{{ Global.greeting }}",
                secret: "{{ Vault.token }}"
            })),
            vault,
            variables,
            events: sink
        });

        const result = await runtime.execute();

        expect(variables.getForWorkflow).toHaveBeenCalledWith("wf-1");
        expect(vault.resolve).toHaveBeenCalledWith("token");
        expect(seen).toEqual([
            {type: "node.started", nodeId: "n1"},
            {type: "node.succeeded", nodeId: "n1", output: {greeting: "hello", secret: "s3cret"}}
        ]);
        expect(result.nodesContext.n1).toEqual({greeting: "hello", secret: "s3cret"});
        expect(result.globalVariables).toEqual({greeting: "hello"});
        expect(result.response).toBeNull();
    });

    it("preserves the terminal response shape without the __isTerminal marker", async () => {
        fakes.executors["Network.Respond"] = async () => ({
            success: true,
            output: {
                __isTerminal: true,
                status: 201,
                headers: {"x-test": "1"},
                body: {ok: true}
            }
        });

        const sink = {emit: vi.fn(async (_event: any) => {})};
        const runtime = new Runtime({
            workflowId: "wf-1",
            userId: "u-1",
            executionId: "ex-1",
            graph: graph("Network.Respond", config()),
            variables: {getForWorkflow: async () => ({})},
            events: sink
        });

        const result = await runtime.execute();

        expect(result.response).toEqual({
            status: 201,
            headers: {"x-test": "1"},
            body: {ok: true}
        });
        expect(sink.emit).toHaveBeenCalledTimes(2);
        expect(sink.emit).toHaveBeenLastCalledWith({
            type: "node.succeeded",
            nodeId: "n1",
            output: {__isTerminal: true, status: 201, headers: {"x-test": "1"}, body: {ok: true}}
        });
    });

    it("preserves the two failure events emitted for a failed node", async () => {
        fakes.executors["Trigger.Manual"] = async () => {
            throw new Error("boom");
        };

        const seen: any[] = [];
        const runtime = new Runtime({
            workflowId: "wf-1",
            userId: "u-1",
            executionId: "ex-1",
            graph: graph("Trigger.Manual", config()),
            variables: {getForWorkflow: async () => ({})},
            events: {emit: vi.fn(async (event: any) => void seen.push(event))}
        });

        const result = await runtime.execute();

        expect(seen).toEqual([
            {type: "node.started", nodeId: "n1"},
            {type: "node.failed", nodeId: "n1", error: "boom"},
            {type: "node.failed", nodeId: "n1", error: null}
        ]);
        expect(result.nodesContext.n1).toBeNull();
        expect(result.response).toBeNull();
    });
});
