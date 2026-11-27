/**
 * Ports owned by the execution domain.
 *
 * `IVaultResolver` is intentionally not re-exported here: it already lives in
 * `../types/vault.ts` and is exported by the package root. Re-exporting it
 * would duplicate the contract.
 */
export * from "./workflowVariableSource.js";
export * from "./workflowEventSink.js";
