import { beforeEach, describe, expect, it, vi } from "vitest";
import { executeWorkflow } from "../src/engine/execution";

const runtimeCapture = vi.hoisted(() => ({
    constructorArgs: [] as any[],
    result: { response: null, nodesContext: { done: true } },
}));

vi.mock("@neuron/runtime", () => ({
    Runtime: class {
        constructor(args: any) {
            runtimeCapture.constructorArgs.push(args);
        }
        async execute() {
            return runtimeCapture.result;
        }
    },
}));

const loggerMock = vi.hoisted(() => ({
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
}));

vi.mock("@neuron/shared", () => ({
    logger: loggerMock,
    NODE_KIND: { TRIGGER_WEBHOOK: "Trigger.Webhook" },
}));

const BODY_SECRET = "body-secret-value";
const NESTED_SECRET = "nested-secret-value";
const QUERY_SECRET = "query-secret-value";
const HEADER_SECRET = "Bearer header-secret-value";

function graphWithTrigger(): any {
    return {
        nodes: [{ id: "trigger-1", type: "Trigger.Webhook", config: { triggerType: "webhook" } }],
        edges: [],
    };
}

function request(): any {
    return {
        body: {
            message: "hello",
            api_key: BODY_SECRET,
            apiKey: BODY_SECRET,
            password: BODY_SECRET,
            nested: { token: NESTED_SECRET, keep: 1 },
        },
        query: { page: "2", token: QUERY_SECRET, secret: QUERY_SECRET, authorization: HEADER_SECRET },
        headers: {
            "content-type": "application/json",
            authorization: HEADER_SECRET,
            "x-neuron-key": HEADER_SECRET,
            cookie: HEADER_SECRET,
        },
    };
}

beforeEach(() => {
    vi.clearAllMocks();
    runtimeCapture.constructorArgs.length = 0;
});

describe("webhookData credential filtering", () => {
    it("removes credential-like fields from webhook body, query and headers before runtime execution", async () => {
        const graph = graphWithTrigger();

        await executeWorkflow(
            { executionId: "exec-1", workflowId: "workflow-1", graph, userId: "owner-1" } as any,
            request(),
        );

        expect(runtimeCapture.constructorArgs).toHaveLength(1);
        const webhookData = runtimeCapture.constructorArgs[0].graph.nodes[0].config.webhookData;
        expect(webhookData.body).toEqual({ message: "hello", nested: { keep: 1 } });
        expect(webhookData.query).toEqual({ page: "2" });
        expect(webhookData.headers).toEqual({ "content-type": "application/json" });
    });

    it("does not expose credential values anywhere in the runtime payload or log context", async () => {
        await executeWorkflow(
            {
                executionId: "exec-1",
                workflowId: "workflow-1",
                graph: graphWithTrigger(),
                userId: "owner-1",
            } as any,
            request(),
        );

        const runtimeText = JSON.stringify(runtimeCapture.constructorArgs);
        const logText = JSON.stringify(loggerMock.info.mock.calls);
        for (const secret of [BODY_SECRET, NESTED_SECRET, QUERY_SECRET, HEADER_SECRET]) {
            expect(runtimeText).not.toContain(secret);
            expect(logText).not.toContain(secret);
        }
    });

    it("injects empty webhook data when the request is missing", async () => {
        const graph = graphWithTrigger();

        await executeWorkflow({
            executionId: "exec-1",
            workflowId: "workflow-1",
            graph,
            userId: "owner-1",
        } as any);

        expect(runtimeCapture.constructorArgs[0].graph.nodes[0].config.webhookData).toEqual({
            body: {},
            query: {},
            headers: {},
        });
    });

    it("leaves graphs without a webhook trigger untouched", async () => {
        const graph: any = {
            nodes: [{ id: "manual-1", type: "Trigger.Manual", config: {} }],
            edges: [],
        };

        await executeWorkflow(
            { executionId: "exec-1", workflowId: "workflow-1", graph, userId: "owner-1" } as any,
            request(),
        );

        expect(runtimeCapture.constructorArgs[0].graph.nodes[0].config).toEqual({});
    });
});
