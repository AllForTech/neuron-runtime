import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SQL } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core";
import {
    deleteDeploymentController,
    getAllDeploymentController,
    getDeploymentController,
} from "../src/controllers/deploy.workflow.controller";
import {
    activateDeployment as repositoryActivateDeployment,
    deactivateDeployment as repositoryDeactivateDeployment,
    deleteDeploymentByWorkflowId as repositoryDeleteDeploymentByWorkflowId,
    getALLDeploymentByWorkflowId as repositoryGetAllDeploymentByWorkflowId,
    getDeploymentByWorkflowId as repositoryGetDeploymentByWorkflowId,
} from "../../../packages/db/src/repository/deployed.workflow.repository";

const OWNER_ID = "owner-1";
const ATTACKER_ID = "attacker-1";
const WORKFLOW_ID = "workflow-1";
const CREATED_AT = new Date("2026-01-01T00:00:00.000Z");
const UPDATED_AT = new Date("2026-01-02T00:00:00.000Z");

type OwnerDeployment = {
    id: string;
    workflowId: string;
    userId: string;
    name: string;
    private: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
};

type RecordedCall = { kind: string; where?: unknown };

// Captures predicates built by the real deployment repository at the drizzle layer.
const clientHarness = vi.hoisted(() => {
    const calls: Array<{ kind: string; where?: unknown }> = [];

    function builder(kind: string, result: unknown) {
        const call: { kind: string; where?: unknown } = { kind };
        calls.push(call);
        const chain: any = {
            from() {
                return chain;
            },
            where(predicate: unknown) {
                call.where = predicate;
                return chain;
            },
            limit() {
                return chain;
            },
            orderBy() {
                return chain;
            },
            values() {
                return chain;
            },
            set() {
                return chain;
            },
            returning() {
                return chain;
            },
            then(resolve: (value: unknown) => unknown, reject: (error: unknown) => unknown) {
                return Promise.resolve(result).then(resolve, reject);
            },
        };
        return chain;
    }

    return {
        calls,
        db: {
            select: () => builder("select", []),
            insert: () => builder("insert", []),
            delete: () => builder("delete", []),
            update: () => builder("update", []),
            query: {
                deployedWorkflows: {
                    findFirst: (args: { where?: unknown }) => {
                        calls.push({ kind: "findFirst", where: args.where });
                        return Promise.resolve(null);
                    },
                    findMany: (args: { where?: unknown }) => {
                        calls.push({ kind: "findMany", where: args.where });
                        return Promise.resolve([]);
                    },
                },
            },
        },
    };
});

vi.mock("../../../packages/db/src/client.js", () => ({ db: clientHarness.db }));

const dbMocks = vi.hoisted(() => ({
    createExecution: vi.fn(),
    deleteDeploymentByWorkflowId: vi.fn(),
    getALLDeploymentByWorkflowId: vi.fn(),
    getDeploymentById: vi.fn(),
    getDeploymentByWorkflowId: vi.fn(),
    saveDeployWorkflowData: vi.fn(),
    updateExecutionStatus: vi.fn(),
}));

// Same contract-enforcing fake as the vault tests: an omitted userId is the
// vulnerable id-only lookup; a supplied userId is owner-scoped.
const store = vi.hoisted(() => ({
    deployments: [] as Array<OwnerDeployment>,
}));

vi.mock("@neuron/db", () => dbMocks);
vi.mock("@neuron/auth", () => ({ supabase: { auth: { getUser: vi.fn() } } }));
vi.mock("@/engine/execution", () => ({ executeWorkflow: vi.fn() }));
vi.mock("@neuron/shared/server", () => ({
    decryptSecret: (value: string) => value,
    encryptSecret: (value: string) => value,
}));

type FakeResponse = {
    statusCode: number;
    body: unknown;
    status(code: number): FakeResponse;
    json(payload: unknown): FakeResponse;
};

function makeResponse(): FakeResponse {
    const response: FakeResponse = {
        statusCode: 200,
        body: undefined,
        status(code: number) {
            this.statusCode = code;
            return this;
        },
        json(payload: unknown) {
            this.body = payload;
            return this;
        },
    };
    return response;
}

function makeRequest(userId: string, workflowId: string) {
    return {
        user: { id: userId },
        params: { workflowId },
        body: {},
        headers: {},
        query: {},
    } as unknown as Parameters<typeof getDeploymentController>[0];
}

function renderedWhere(call: RecordedCall | undefined) {
    expect(call?.where, "repository did not build a where predicate").toBeDefined();
    return new PgDialect().sqlToQuery(call!.where as SQL);
}

function ownerDeployment(): OwnerDeployment {
    return {
        id: "deployment-1",
        workflowId: WORKFLOW_ID,
        userId: OWNER_ID,
        name: "Deploy",
        private: false,
        isActive: true,
        createdAt: CREATED_AT,
        updatedAt: UPDATED_AT,
    };
}

beforeEach(() => {
    vi.clearAllMocks();
    clientHarness.calls.length = 0;
    store.deployments.splice(0, store.deployments.length, ownerDeployment());

    dbMocks.getDeploymentByWorkflowId.mockImplementation(async (workflowId: string, userId?: string) =>
        store.deployments.find(
            (deployment) =>
                deployment.workflowId === workflowId &&
                (userId === undefined || deployment.userId === userId),
        ) ?? null,
    );
    dbMocks.getALLDeploymentByWorkflowId.mockImplementation(
        async (workflowId: string, userId?: string) =>
            store.deployments.filter(
                (deployment) =>
                    deployment.workflowId === workflowId &&
                    (userId === undefined || deployment.userId === userId),
            ),
    );
    dbMocks.deleteDeploymentByWorkflowId.mockImplementation(
        async (workflowId: string, userId?: string) => {
            const removed = store.deployments.filter(
                (deployment) =>
                    deployment.workflowId === workflowId &&
                    (userId === undefined || deployment.userId === userId),
            );
            for (const deployment of removed) {
                store.deployments.splice(store.deployments.indexOf(deployment), 1);
            }
            return removed[0] ?? null;
        },
    );
});

describe("deployment repository owner scoping", () => {
    it("scopes getDeploymentByWorkflowId to the authenticated userId", async () => {
        await repositoryGetDeploymentByWorkflowId(WORKFLOW_ID, ATTACKER_ID);

        const query = renderedWhere(clientHarness.calls.at(-1));
        expect(query.sql).toContain('"user_id"');
        expect(query.params).toContain(WORKFLOW_ID);
        expect(query.params).toContain(ATTACKER_ID);
    });

    it("scopes getALLDeploymentByWorkflowId to the authenticated userId", async () => {
        await repositoryGetAllDeploymentByWorkflowId(WORKFLOW_ID, ATTACKER_ID);

        const query = renderedWhere(clientHarness.calls.at(-1));
        expect(query.sql).toContain('"user_id"');
        expect(query.params).toContain(WORKFLOW_ID);
        expect(query.params).toContain(ATTACKER_ID);
    });

    it("scopes deleteDeploymentByWorkflowId to the authenticated userId", async () => {
        await repositoryDeleteDeploymentByWorkflowId(WORKFLOW_ID, ATTACKER_ID);

        const query = renderedWhere(clientHarness.calls.at(-1));
        expect(query.sql).toContain('"user_id"');
        expect(query.params).toContain(WORKFLOW_ID);
        expect(query.params).toContain(ATTACKER_ID);
    });

    it("scopes deployment activation and deactivation to the authenticated userId", async () => {
        await repositoryDeactivateDeployment(WORKFLOW_ID, ATTACKER_ID);
        const deactivate = renderedWhere(clientHarness.calls.at(-1));
        expect(deactivate.sql).toContain('"user_id"');
        expect(deactivate.params).toContain(ATTACKER_ID);

        await repositoryActivateDeployment(WORKFLOW_ID, ATTACKER_ID);
        const activate = renderedWhere(clientHarness.calls.at(-1));
        expect(activate.sql).toContain('"user_id"');
        expect(activate.params).toContain(ATTACKER_ID);
    });
});

describe("deployment controller cross-user authorization", () => {
    it("returns 404 for a cross-user deployment read", async () => {
        const response = makeResponse();

        await getDeploymentController(makeRequest(ATTACKER_ID, WORKFLOW_ID), response);

        expect(dbMocks.getDeploymentByWorkflowId).toHaveBeenCalledWith(WORKFLOW_ID, ATTACKER_ID);
        expect(response.statusCode).toBe(404);
        expect(response.body).not.toEqual(
            expect.objectContaining({ id: "deployment-1", name: "Deploy" }),
        );
    });

    it("keeps the owner deployment read response shape", async () => {
        const response = makeResponse();

        await getDeploymentController(makeRequest(OWNER_ID, WORKFLOW_ID), response);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            id: "deployment-1",
            name: "Deploy",
            private: false,
            isActive: true,
            createdAt: CREATED_AT,
            updatedAt: UPDATED_AT,
        });
    });

    it("returns an empty list for a cross-user deployment list read without leaking the owner's rows", async () => {
        const response = makeResponse();

        await getAllDeploymentController(makeRequest(ATTACKER_ID, WORKFLOW_ID), response);

        expect(dbMocks.getALLDeploymentByWorkflowId).toHaveBeenCalledWith(WORKFLOW_ID, ATTACKER_ID);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual([]);
        expect(store.deployments).toEqual([ownerDeployment()]);
    });

    it("keeps the frozen 200 [] contract for an owner with zero deployments", async () => {
        store.deployments.splice(0, store.deployments.length);
        const response = makeResponse();

        await getAllDeploymentController(makeRequest(OWNER_ID, WORKFLOW_ID), response);

        expect(dbMocks.getALLDeploymentByWorkflowId).toHaveBeenCalledWith(WORKFLOW_ID, OWNER_ID);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual([]);
    });

    it("keeps the owner deployment list response shape", async () => {
        const response = makeResponse();

        await getAllDeploymentController(makeRequest(OWNER_ID, WORKFLOW_ID), response);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual([ownerDeployment()]);
    });

    it("returns 404 for a cross-user deployment delete and leaves the row intact", async () => {
        const response = makeResponse();

        await deleteDeploymentController(makeRequest(ATTACKER_ID, WORKFLOW_ID), response);

        expect(dbMocks.deleteDeploymentByWorkflowId).toHaveBeenCalledWith(WORKFLOW_ID, ATTACKER_ID);
        expect(response.statusCode).toBe(404);
        expect(store.deployments).toEqual([ownerDeployment()]);
    });

    it("keeps the owner deployment delete response shape", async () => {
        const response = makeResponse();

        await deleteDeploymentController(makeRequest(OWNER_ID, WORKFLOW_ID), response);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            success: true,
            message: "Orchestration terminated successfully.",
            data: ownerDeployment(),
        });
        expect(store.deployments).toHaveLength(0);
    });
});
