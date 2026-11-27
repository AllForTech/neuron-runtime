import { beforeEach, describe, expect, it, vi } from "vitest";
import { deployWorkflowController } from "../src/controllers/deploy.workflow.controller";
import { deployPayloadSchema } from "../src/schemas/deployment";

const mocks = vi.hoisted(() => ({
    saveDeployWorkflowData: vi.fn(),
    createExecution: vi.fn(),
    deleteDeploymentByWorkflowId: vi.fn(),
    getALLDeploymentByWorkflowId: vi.fn(),
    getDeploymentById: vi.fn(),
    getDeploymentByWorkflowId: vi.fn(),
    updateExecutionStatus: vi.fn(),
    encryptSecret: vi.fn(),
    decryptSecret: vi.fn(),
    getUser: vi.fn(),
    executeWorkflow: vi.fn(),
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
vi.mock("@neuron/auth", () => ({ supabase: { auth: { getUser: mocks.getUser } } }));
vi.mock("@/engine/execution", () => ({ executeWorkflow: mocks.executeWorkflow }));
vi.mock("@neuron/shared/server", () => ({
    encryptSecret: mocks.encryptSecret,
    decryptSecret: mocks.decryptSecret,
}));

function makeResponse() {
    return {
        statusCode: 200,
        body: undefined as unknown,
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

function makeRequest(body: unknown, workflowId = "workflow-1") {
    return {
        params: { workflowId },
        headers: { authorization: "Bearer token" },
        body,
    } as any;
}

function validPayload(overrides: Record<string, unknown> = {}) {
    return {
        name: "Deployed",
        private: false,
        nodes: [{ id: "n1", type: "Network.Http", config: { url: "https://example.com" }, positionX: 1 }],
        edges: [],
        ...overrides,
    };
}

beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUser.mockResolvedValue({ data: { user: { id: "owner-1" } }, error: null });
    mocks.encryptSecret.mockImplementation((value: string) => `encrypted:${value}`);
    mocks.saveDeployWorkflowData.mockImplementation(async () => ({ id: "deployment-1" }));
});

describe("deployment payload schema", () => {
    it("accepts a well-formed payload and preserves extra graph fields", () => {
        const result = deployPayloadSchema.safeParse(validPayload());

        expect(result.success).toBe(true);
        if (!result.success) return;
        expect(result.data.nodes[0]).toMatchObject({ positionX: 1 });
        expect(result.data.private).toBe(false);
    });

    it("rejects a payload with no nodes or non-array nodes", () => {
        expect(deployPayloadSchema.safeParse(validPayload({ nodes: [] })).success).toBe(false);
        expect(deployPayloadSchema.safeParse(validPayload({ nodes: "nope" })).success).toBe(false);
        expect(deployPayloadSchema.safeParse({ name: "X", private: false, edges: [] }).success).toBe(false);
    });

    it("rejects malformed nodes, edges and field types", () => {
        expect(deployPayloadSchema.safeParse(validPayload({ nodes: [{ type: "X" }] })).success).toBe(false);
        expect(
            deployPayloadSchema.safeParse(
                validPayload({ edges: [{ id: "e1", source: "n1" }] }),
            ).success,
        ).toBe(false);
        expect(deployPayloadSchema.safeParse(validPayload({ private: "yes" })).success).toBe(false);
        expect(deployPayloadSchema.safeParse(validPayload({ secretKey: 42 })).success).toBe(false);
    });

    it("rejects edges that reference nodes absent from the graph", () => {
        const payload = validPayload({
            edges: [{ id: "e1", source: "n1", target: "missing-node" }],
        });

        expect(deployPayloadSchema.safeParse(payload).success).toBe(false);
    });

    it("accepts an omitted private flag without inventing a secret requirement", () => {
        const payload = validPayload();
        delete payload.private;

        const result = deployPayloadSchema.safeParse(payload);

        expect(result.success).toBe(true);
        if (!result.success) return;
        expect(result.data.private).toBeUndefined();
    });

    it("requires a secret key only for an explicit private deployment", () => {
        expect(deployPayloadSchema.safeParse(validPayload({ private: true })).success).toBe(false);
        expect(
            deployPayloadSchema.safeParse(validPayload({ private: true, secretKey: "secret" })).success,
        ).toBe(true);
    });

    it("bounds oversized payloads", () => {
        expect(
            deployPayloadSchema.safeParse(validPayload({ name: "x".repeat(300) })).success,
        ).toBe(false);
        expect(
            deployPayloadSchema.safeParse(
                validPayload({ nodes: Array.from({ length: 5000 }, (_, index) => ({ id: `n${index}`, type: "X" })) }),
            ).success,
        ).toBe(false);
    });
});

describe("deployment controller payload validation", () => {
    it("returns 400 and does not persist a malformed payload", async () => {
        const response = makeResponse();

        await deployWorkflowController(makeRequest({ name: "X", private: false, nodes: "bad", edges: [] }), response);

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({ error: "Invalid deployment payload" });
        expect(mocks.saveDeployWorkflowData).not.toHaveBeenCalled();
    });

    it("still persists a valid public deployment with the frozen response shape", async () => {
        const response = makeResponse();

        await deployWorkflowController(makeRequest(validPayload()), response);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ id: "deployment-1" });
        expect(mocks.saveDeployWorkflowData).toHaveBeenCalledTimes(1);
        const [workflowId, data] = mocks.saveDeployWorkflowData.mock.calls[0];
        expect(workflowId).toBe("workflow-1");
        expect(data).toMatchObject({
            userId: "owner-1",
            name: "Deployed",
            private: false,
            secretKey: null,
            isActive: true,
        });
    });

    it("stores an omitted private flag as private without an encrypted key", async () => {
        const response = makeResponse();
        const payload = validPayload();
        delete payload.private;

        await deployWorkflowController(makeRequest(payload), response);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ id: "deployment-1" });
        expect(mocks.encryptSecret).not.toHaveBeenCalled();
        const [, data] = mocks.saveDeployWorkflowData.mock.calls[0];
        expect(data.private).toBe(true);
        expect(data.secretKey).toBeNull();
        expect(data).toMatchObject({
            userId: "owner-1",
            name: "Deployed",
            isActive: true,
        });
    });

    it("encrypts the key for a valid private deployment", async () => {
        const response = makeResponse();

        await deployWorkflowController(
            makeRequest(validPayload({ private: true, secretKey: "plaintext-secret" })),
            response,
        );

        expect(response.statusCode).toBe(200);
        expect(mocks.encryptSecret).toHaveBeenCalledWith("plaintext-secret");
        const [, data] = mocks.saveDeployWorkflowData.mock.calls[0];
        expect(data.secretKey).toBe("encrypted:plaintext-secret");
        expect(data.private).toBe(true);
    });
});
