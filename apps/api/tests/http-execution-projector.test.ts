import { beforeEach, describe, expect, it, vi } from "vitest";

// The controllers must reach execution through the single orchestration entry
// that already owns runtime collaboration. Mock it (rather than the runtime)
// so a regression that bypasses the seam fails the HTTP contract assertions.
const mocks = vi.hoisted(() => ({
    getDeploymentById: vi.fn(),
    createExecution: vi.fn(),
    updateExecutionStatus: vi.fn(),
    getWorkflowGraph: vi.fn(),
    executeWorkflow: vi.fn(),
}));

vi.mock("@neuron/db", () => ({
    addNodeToWorkflow: vi.fn(),
    createExecution: mocks.createExecution,
    createWorkflow: vi.fn(),
    deleteDeploymentByWorkflowId: vi.fn(),
    deleteWorkflow: vi.fn(),
    getALLDeploymentByWorkflowId: vi.fn(),
    getDeploymentById: mocks.getDeploymentById,
    getDeploymentByWorkflowId: vi.fn(),
    getExecutionsByWorkflow: vi.fn(),
    getGlobalVariables: vi.fn(),
    getWorkflowGraph: mocks.getWorkflowGraph,
    getWorkflowsByUser: vi.fn(),
    saveDeployWorkflowData: vi.fn(),
    saveGlobalVariables: vi.fn(),
    updateExecutionStatus: mocks.updateExecutionStatus,
}));
vi.mock("@neuron/auth", () => ({ supabase: { auth: { getUser: vi.fn() } } }));
vi.mock("@neuron/shared/server", () => ({
    decryptSecret: (value: string) => value,
    encryptSecret: (value: string) => value,
}));
vi.mock("@/engine/execution", () => ({ executeWorkflow: mocks.executeWorkflow }));

import { HttpExecutionProjector } from "../src/application/projectors/http-execution.projector.js";
import { executeDeployedWorkflowController } from "../src/controllers/deploy.workflow.controller";
import { executeWorkflowController } from "../src/controllers/workflow.controllers";

type FakeResponse = {
    statusCode: number;
    headers?: Record<string, string>;
    body: unknown;
    set(headers: Record<string, string>): FakeResponse;
    status(code: number): FakeResponse;
    json(payload: unknown): FakeResponse;
};

function makeResponse(): FakeResponse {
    return {
        statusCode: 200,
        body: undefined,
        set(headers: Record<string, string>) {
            this.headers = headers;
            return this;
        },
        status(code: number) {
            this.statusCode = code;
            return this;
        },
        json(payload: unknown) {
            this.body = payload;
            return this;
        },
    };
}

const DEPLOYMENT = {
    id: "deployment-1",
    workflowId: "workflow-1",
    userId: "owner-1",
    private: false,
    secretKey: null,
    nodes: [],
    edges: [],
};

const GRAPH = { nodes: [], edges: [] };

const TERMINAL_RESULT = {
    nodesContext: { node: { ok: true } },
    globalVariables: {},
    response: {
        status: 201,
        headers: { "x-neuron-test": "frozen" },
        body: { terminal: true },
    },
};

const DEFAULT_RESULT = {
    nodesContext: { node: { ok: true } },
    globalVariables: {},
    response: null,
};

beforeEach(() => {
    vi.clearAllMocks();
    mocks.getDeploymentById.mockResolvedValue(DEPLOYMENT);
    mocks.createExecution.mockResolvedValue({ id: "execution-1" });
    mocks.updateExecutionStatus.mockResolvedValue(undefined);
    mocks.getWorkflowGraph.mockResolvedValue(GRAPH);
    mocks.executeWorkflow.mockResolvedValue(TERMINAL_RESULT);
});

describe("HTTP execution projector contract through the orchestration entry", () => {
    it("keeps the frozen terminal status, headers and body", async () => {
        const response = makeResponse();
        const request = { params: { deploymentId: DEPLOYMENT.id }, headers: {}, query: {}, body: {} };

        await executeDeployedWorkflowController(request as any, response as any);

        expect(mocks.executeWorkflow).toHaveBeenCalledTimes(1);
        expect(mocks.executeWorkflow.mock.calls[0][0]).toMatchObject({
            executionId: "execution-1",
            workflowId: "workflow-1",
            userId: "owner-1",
            graph: GRAPH,
        });
        expect(mocks.executeWorkflow.mock.calls[0][1]).toBe(request);
        expect(response.statusCode).toBe(201);
        expect(response.headers).toEqual({ "x-neuron-test": "frozen" });
        expect(response.body).toEqual({ terminal: true });
        expect(mocks.updateExecutionStatus).toHaveBeenCalledWith(
            expect.objectContaining({ executionId: "execution-1", status: "success" }),
            "workflow-1",
        );
    });

    it("keeps the frozen 200 default body when the runtime has no terminal response", async () => {
        mocks.executeWorkflow.mockResolvedValue(DEFAULT_RESULT);
        const response = makeResponse();

        await executeDeployedWorkflowController(
            { params: { deploymentId: DEPLOYMENT.id }, headers: {}, query: {}, body: {} } as any,
            response as any,
        );

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            success: true,
            message: "Workflow executed successfully.",
            data: { node: { ok: true } },
        });
    });

    it("keeps the frozen 500 execution-error body", async () => {
        mocks.executeWorkflow.mockRejectedValue(new Error("boom"));
        const response = makeResponse();

        await executeDeployedWorkflowController(
            { params: { deploymentId: DEPLOYMENT.id }, headers: {}, query: {}, body: {} } as any,
            response as any,
        );

        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual({
            success: false,
            error: "Internal Workflow Execution Error",
            message: "boom",
        });
        expect(mocks.updateExecutionStatus).toHaveBeenCalledWith(
            expect.objectContaining({ executionId: "execution-1", status: "failed", result: "boom" }),
            "workflow-1",
        );
    });

    it("keeps the frozen 202 accepted body for internal execution", async () => {
        const response = makeResponse();
        const request = {
            user: { id: "owner-1" },
            params: { workflowId: "workflow-1" },
            body: {},
            headers: {},
        };

        await executeWorkflowController(request as any, response as any);

        expect(response.statusCode).toBe(202);
        expect(response.body).toEqual({ message: "Execution started", workflowId: "workflow-1" });
        await vi.waitFor(() => expect(mocks.executeWorkflow).toHaveBeenCalledTimes(1));
        expect(mocks.executeWorkflow.mock.calls[0][0]).toMatchObject({
            executionId: "execution-1",
            workflowId: "workflow-1",
            userId: "owner-1",
            graph: GRAPH,
        });
        expect(mocks.executeWorkflow.mock.calls[0][1]).toBe(request);
    });
});

describe("HttpExecutionProjector wire literals", () => {
    it("projects terminal and default responses directly", () => {
        const terminal = makeResponse();
        HttpExecutionProjector.projectDeployedSuccess(terminal, TERMINAL_RESULT);
        expect(terminal.statusCode).toBe(201);
        expect(terminal.headers).toEqual({ "x-neuron-test": "frozen" });
        expect(terminal.body).toEqual({ terminal: true });

        const fallback = makeResponse();
        HttpExecutionProjector.projectDeployedSuccess(fallback, DEFAULT_RESULT);
        expect(fallback.statusCode).toBe(200);
        expect(fallback.body).toEqual({
            success: true,
            message: "Workflow executed successfully.",
            data: { node: { ok: true } },
        });
    });

    it("projects the 500 error and 202 accepted literals", () => {
        const failed = makeResponse();
        HttpExecutionProjector.projectDeployedExecutionError(failed, new Error("boom"));
        expect(failed.statusCode).toBe(500);
        expect(failed.body).toEqual({
            success: false,
            error: "Internal Workflow Execution Error",
            message: "boom",
        });

        const accepted = makeResponse();
        HttpExecutionProjector.projectInternalAccepted(accepted, "workflow-1");
        expect(accepted.statusCode).toBe(202);
        expect(accepted.body).toEqual({ message: "Execution started", workflowId: "workflow-1" });
    });
});
