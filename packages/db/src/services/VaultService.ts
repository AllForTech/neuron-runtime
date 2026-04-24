import { findSecretByName } from "../repository/index.js";

export class VaultService {
    private cache: Map<string, string> = new Map();
    private readonly userId: string;

    constructor(userId: string) {
        this.userId = userId;
    }

    async resolve(key: string): Promise<string> {
        if (this.cache.has(key)) {
            return this.cache.get(key)!;
        }

        const secret = await findSecretByName(key, this.userId);

        if (!secret) {
            throw new Error(`Vault secret not found: ${key}`);
        }

        // TODO: Decrypt value before returning.
        // Decrypt the secret here so the consumer doesn't have to
        // const decryptedValue = decrypt({
        //     content: secret.content,
        //     iv: secret.iv,
        //     tag: secret.tag,
        // });

        this.cache.set(key, secret.content);
        return secret.content;
    }
}