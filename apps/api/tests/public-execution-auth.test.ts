import { beforeEach, describe, expect, it, vi } from "vitest";
import { executeDeployedWorkflowController } from "../src/controllers/deploy.workflow.controller";

const mocks = vi.hoisted(() => ({
    getDeploymentById: vi.fn(),
    createExecution: vi.fn(),
    updateExecutionStatus: vi.fn(),
    saveDeployWorkflowData: vi.fn(),
    getDeploymentByWorkflowId: vi.fn(),
    getALLDeploymentByWorkflowId: vi.fn(),
    deleteDeploymentByWorkflowId: vi.fn(),
    executeWorkflow: vi.fn(),
    decryptSecret: vi.fn(),
    encryptSecret: vi.fn(),
}));

vi.mock("@neuron/db", () => ({
    createExecution: mocks.createExecution,
    deleteDeploymentByWorkflowId: mocks.deleteDeploymentByWorkflowId,
    getALLDeploymentByWorkflowId: mocks.getALLDeploymentByWorkflowId,
    getDeploymentById: mocks.getDeploymentById,
    getDeploymentByWorkflowId: mocks.getDeploymentByWorkflowId,
    saveDeployWorkflowData: mocks.saveDeployWorkflowData,
    updateExecutionStatus: mocks.updateExecutionStatus,
}));
vi.mock("@neuron/auth", () => ({ supabase: { auth: { getUser: vi.fn() } } }));
vi.mock("@/engine/execution", () => ({ executeWorkflow: mocks.executeWorkflow }));
vi.mock("@neuron/shared/server", () => ({
    decryptSecret: mocks.decryptSecret,
    encryptSecret: mocks.encryptSecret,
}));

type FakeResponse = {
    statusCode: number;
    body: unknown;
    set(name: string, value: string): FakeResponse;
    status(code: number): FakeResponse;
    json(payload: unknown): FakeResponse;
};

function makeResponse(): FakeResponse {
    return {
        statusCode: 200,
        body: undefined,
        set() {
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
    private: true,
    secretKey: "master-secret",
    nodes: [],
    edges: [],
    isActive: true,
};

beforeEach(() => {
    vi.clearAllMocks();
    mocks.getDeploymentById.mockResolvedValue(DEPLOYMENT);
    mocks.createExecution.mockResolvedValue({ id: "execution-1" });
    mocks.updateExecutionStatus.mockResolvedValue(undefined);
    mocks.decryptSecret.mockImplementation((value: string) => value);
    mocks.executeWorkflow.mockResolvedValue({
        response: { status: 200, body: { ok: true } },
        nodesContext: {},
    });
});

describe("public execution secret header contract", () => {
    it("rejects a private deployment when the key is supplied only via the api_key query string", async () => {
        const response = makeResponse();
        const request = {
            params: { deploymentId: DEPLOYMENT.id },
            headers: {},
            query: { api_key: DEPLOYMENT.secretKey },
            body: {},
        };

        await executeDeployedWorkflowController(request as any, response as any);

        expect(response.statusCode).toBe(401);
        expect(response.body).toEqual({
            success: false,
            error: "Authentication Required",
            message: "Missing 'X-Neuron-Key' header.",
        });
        expect(mocks.executeWorkflow).not.toHaveBeenCalled();
        expect(mocks.createExecution).not.toHaveBeenCalled();
    });

    it("accepts the key via the X-Neuron-Key header and keeps the frozen 200 response shape", async () => {
        const response = makeResponse();
        const request = {
            params: { deploymentId: DEPLOYMENT.id },
            headers: { "x-neuron-key": DEPLOYMENT.secretKey },
            query: {},
            body: {},
        };

        await executeDeployedWorkflowController(request as any, response as any);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ ok: true });
        expect(mocks.executeWorkflow).toHaveBeenCalledTimes(1);
        expect(mocks.updateExecutionStatus).toHaveBeenCalledWith(
            expect.objectContaining({ status: "success", executionId: "execution-1" }),
            DEPLOYMENT.workflowId,
        );
    });

    it("does not let an api_key query value rescue an incorrect header", async () => {
        const response = makeResponse();
        const request = {
            params: { deploymentId: DEPLOYMENT.id },
            headers: { "x-neuron-key": "wrong-key" },
            query: { api_key: DEPLOYMENT.secretKey },
            body: {},
        };

        await executeDeployedWorkflowController(request as any, response as any);

        expect(response.statusCode).toBe(403);
        expect(response.body).toEqual({
            success: false,
            error: "Invalid Identity",
            message: "The provided secret key is incorrect or tampered with.",
        });
        expect(mocks.executeWorkflow).not.toHaveBeenCalled();
    });

    it("ignores a supplied api_key query value for a valid header request", async () => {
        const response = makeResponse();
        const request = {
            params: { deploymentId: DEPLOYMENT.id },
            headers: { "x-neuron-key": DEPLOYMENT.secretKey },
            query: { api_key: "attacker-controlled" },
            body: {},
        };

        await executeDeployedWorkflowController(request as any, response as any);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ ok: true });
    });
});
