import {getGlobalVariables} from "@neuron/db";
import type {WorkflowVariableSource} from "@neuron/shared";

/**
 * Adapts the global-variable repository to the engine-owned port.
 * The row-to-record mapping that used to live in Runtime.initialize now lives
 * at the adapter boundary; duplicate keys keep the same last-write behavior.
 */
export class DbWorkflowVariableSource implements WorkflowVariableSource {
    async getForWorkflow(workflowId: string): Promise<Record<string, string>> {
        const rows = await getGlobalVariables(workflowId);
        const variables: Record<string, string> = {};

        if (rows) {
            for (const row of rows) {
                variables[row.key] = row.value as string;
            }
        }

        return variables;
    }
}
