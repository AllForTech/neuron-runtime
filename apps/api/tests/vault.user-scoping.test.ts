import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SQL } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core";
import {
    deleteSecret,
    getDecryptedSecret,
} from "../src/controllers/vault.controllers";
import {
    deleteVaultSecretById as repositoryDeleteVaultSecretById,
    findSecretById as repositoryFindSecretById,
} from "../../../packages/db/src/repository/vault.repository";

const OWNER_ID = "owner-1";
const ATTACKER_ID = "attacker-1";
const SECRET_ID = "secret-1";
const SECRET_NAME = "API_KEY";
const SECRET_CONTENT = "nrn_live_owner_value";

type RecordedCall = { kind: string; where?: unknown };

// Captures the predicates the real repository passes to drizzle, so the tests
// prove owner scoping reaches the SQL layer rather than only the controller.
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
        },
    };
});

vi.mock("../../../packages/db/src/client.js", () => ({ db: clientHarness.db }));

const dbMocks = vi.hoisted(() => ({
    getAllVaultSecrets: vi.fn(),
    insertVaultSecret: vi.fn(),
    deleteVaultSecretById: vi.fn(),
    findSecretById: vi.fn(),
}));

// The fake repository models both states of the contract: with no userId
// argument it performs the vulnerable id-only lookup; with a userId it is
// owner-scoped. A controller that omits userId therefore still leaks the row.
const store = vi.hoisted(() => ({
    secrets: [] as Array<{ id: string; name: string; content: string; userId: string }>,
}));

vi.mock("@neuron/db", () => dbMocks);
vi.mock("@neuron/shared/server", () => ({
    SECRET_PREFIX: "nrn_live_",
    encryptSecret: (value: string) => value,
    decryptSecret: (value: string) => value,
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

function makeRequest(userId: string, id: string) {
    return {
        user: { id: userId },
        params: { id },
        body: {},
    } as unknown as Parameters<typeof getDecryptedSecret>[0];
}

function renderedWhere(call: RecordedCall | undefined) {
    expect(call?.where, "repository did not build a where predicate").toBeDefined();
    return new PgDialect().sqlToQuery(call!.where as SQL);
}

beforeEach(() => {
    vi.clearAllMocks();
    clientHarness.calls.length = 0;
    store.secrets.splice(
        0,
        store.secrets.length,
        { id: SECRET_ID, name: SECRET_NAME, content: SECRET_CONTENT, userId: OWNER_ID },
    );

    dbMocks.findSecretById.mockImplementation(async (id: string, userId?: string) =>
        store.secrets.find(
            (secret) => secret.id === id && (userId === undefined || secret.userId === userId),
        ) ?? null,
    );
    dbMocks.deleteVaultSecretById.mockImplementation(async (id: string, userId?: string) => {
        const removed = store.secrets.filter(
            (secret) => secret.id === id && (userId === undefined || secret.userId === userId),
        );
        for (const secret of removed) {
            store.secrets.splice(store.secrets.indexOf(secret), 1);
        }
        return removed;
    });
});

describe("vault repository owner scoping", () => {
    it("scopes findSecretById to the authenticated userId", async () => {
        await repositoryFindSecretById(SECRET_ID, ATTACKER_ID);

        const query = renderedWhere(clientHarness.calls.at(-1));
        expect(query.sql).toContain('"user_id"');
        expect(query.params).toContain(SECRET_ID);
        expect(query.params).toContain(ATTACKER_ID);
    });

    it("scopes deleteVaultSecretById to the authenticated userId", async () => {
        await repositoryDeleteVaultSecretById(SECRET_ID, ATTACKER_ID);

        const query = renderedWhere(clientHarness.calls.at(-1));
        expect(query.sql).toContain('"user_id"');
        expect(query.params).toContain(SECRET_ID);
        expect(query.params).toContain(ATTACKER_ID);
    });
});

describe("vault controller cross-user authorization", () => {
    it("returns 404 for a cross-user secret read without disclosing the secret", async () => {
        const response = makeResponse();

        await getDecryptedSecret(makeRequest(ATTACKER_ID, SECRET_ID), response);

        expect(dbMocks.findSecretById).toHaveBeenCalledWith(SECRET_ID, ATTACKER_ID);
        expect(response.statusCode).toBe(404);
        expect(response.body).not.toEqual({ name: SECRET_NAME, value: SECRET_CONTENT });
        expect(store.secrets).toHaveLength(1);
    });

    it("keeps the owner secret read response shape", async () => {
        const response = makeResponse();

        await getDecryptedSecret(makeRequest(OWNER_ID, SECRET_ID), response);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ name: SECRET_NAME, value: SECRET_CONTENT });
    });

    it("returns 404 for a cross-user secret delete and leaves the row intact", async () => {
        const response = makeResponse();

        await deleteSecret(makeRequest(ATTACKER_ID, SECRET_ID), response);

        expect(dbMocks.deleteVaultSecretById).toHaveBeenCalledWith(SECRET_ID, ATTACKER_ID);
        expect(response.statusCode).toBe(404);
        expect(store.secrets.map((secret) => secret.id)).toEqual([SECRET_ID]);
    });

    it("keeps the owner secret delete response shape", async () => {
        const response = makeResponse();

        await deleteSecret(makeRequest(OWNER_ID, SECRET_ID), response);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ message: "Secret deleted successfully" });
        expect(store.secrets).toHaveLength(0);
    });
});
