import {VaultService} from "@neuron/db";
import type {IVaultResolver} from "@neuron/shared";

/**
 * Adapts the persistence vault service to the engine-owned port.
 * A single service instance is kept per execution, preserving the existing
 * resolve/cache behavior.
 */
export class DbVaultResolver implements IVaultResolver {
    private readonly service: VaultService;

    constructor(userId: string) {
        this.service = new VaultService(userId);
    }

    resolve(key: string): Promise<string> {
        return this.service.resolve(key);
    }
}
