import { findSecretByName } from "../repository";
import {decryptSecret, SECRET_PREFIX} from "@neuron/shared/server";

export class VaultService {
    private cache: Map<string, string> = new Map();
    private readonly userId: string;

    constructor(userId: string) {
        this.userId = userId;
    }

    async resolve(name: string): Promise<string> {
        if (this.cache.has(name)) {
            return this.cache.get(name)!;
        }

        const secret = await findSecretByName(name, this.userId);

        if (!secret) {
            throw new Error(`Vault secret not found: ${name}`);
        }

        const decryptedSecret = secret.content.startsWith(SECRET_PREFIX) ? secret.content : decryptSecret(secret.content)

        this.cache.set(name, decryptedSecret);
        return secret.content;
    }
}