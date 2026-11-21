import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { encryptSecret, SECRET_PREFIX } from "@neuron/shared/server";

const repository = vi.hoisted(() => ({
    findSecretByName: vi.fn(),
}));

vi.mock("../repository", () => ({
    findSecretByName: repository.findSecretByName,
}));

import { VaultService } from "./VaultService";

const USER_ID = "user-1";

describe("VaultService.resolve contract", () => {
    const originalKey = process.env.ENCRYPTION_KEY;

    beforeEach(() => {
        process.env.ENCRYPTION_KEY = "11".repeat(32);
        repository.findSecretByName.mockReset();
    });

    afterEach(() => {
        if (originalKey === undefined) {
            delete process.env.ENCRYPTION_KEY;
        } else {
            process.env.ENCRYPTION_KEY = originalKey;
        }
    });

    it("returns decrypted plaintext (never stored ciphertext) on first and cached calls", async () => {
        const plaintext = "live-plaintext-value";
        const ciphertext = encryptSecret(plaintext);
        expect(ciphertext).not.toContain(plaintext);

        repository.findSecretByName.mockResolvedValue({
            name: "API_KEY",
            content: ciphertext,
            userId: USER_ID,
        });

        const service = new VaultService(USER_ID);

        await expect(service.resolve("API_KEY")).resolves.toBe(plaintext);
        await expect(service.resolve("API_KEY")).resolves.toBe(plaintext);
        expect(repository.findSecretByName).toHaveBeenCalledTimes(1);
        expect(repository.findSecretByName).toHaveBeenCalledWith("API_KEY", USER_ID);
    });

    it("returns an already-plaintext prefixed secret unchanged", async () => {
        const plaintext = `${SECRET_PREFIX}already-plain`;
        repository.findSecretByName.mockResolvedValue({
            name: "PREFIXED_KEY",
            content: plaintext,
            userId: USER_ID,
        });

        const service = new VaultService(USER_ID);

        await expect(service.resolve("PREFIXED_KEY")).resolves.toBe(plaintext);
    });

    it("keeps the missing-secret error and userId-scoped lookup unchanged", async () => {
        repository.findSecretByName.mockResolvedValue(null);

        const service = new VaultService(USER_ID);

        await expect(service.resolve("MISSING")).rejects.toThrow(
            "Vault secret not found: MISSING",
        );
        expect(repository.findSecretByName).toHaveBeenCalledWith("MISSING", USER_ID);
    });
});
