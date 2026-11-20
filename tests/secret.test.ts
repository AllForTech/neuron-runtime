import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  decryptSecret,
  encryptSecret,
  SECRET_PREFIX,
} from "../packages/shared/src/utils/secret";

describe("secret encryption", () => {
  const originalKey = process.env.ENCRYPTION_KEY;

  beforeEach(() => {
    process.env.ENCRYPTION_KEY = "11".repeat(32);
  });

  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env.ENCRYPTION_KEY;
    } else {
      process.env.ENCRYPTION_KEY = originalKey;
    }
  });

  it("round-trips plaintext through AES-256-GCM", () => {
    const plaintext = `${SECRET_PREFIX}super-secret`;
    const ciphertext = encryptSecret(plaintext);

    expect(ciphertext.split(":")).toHaveLength(3);
    expect(ciphertext).not.toContain("super-secret");
    expect(decryptSecret(ciphertext)).toBe(plaintext);
  });

  it("uses a fresh IV for each encryption", () => {
    const plaintext = "same-value";
    expect(encryptSecret(plaintext)).not.toBe(encryptSecret(plaintext));
  });

  it("rejects malformed ciphertext", () => {
    expect(() => decryptSecret("missing-parts")).toThrow(
      /Invalid encryption format/,
    );
  });

  it("requires ENCRYPTION_KEY to be configured", () => {
    delete process.env.ENCRYPTION_KEY;
    expect(() => encryptSecret("value")).toThrow(
      /ENCRYPTION_KEY is missing/,
    );
  });
});
