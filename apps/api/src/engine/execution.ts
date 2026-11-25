import {createDefaultRuntimeCollaborators} from "../adapters/index.js";
import {ExecuteWorkflowUseCase} from "../application/execute-workflow.use-case.js";
import type {ExecuteWorkflowType} from "@neuron/runtime";

export type FinalResponseType = {
    status: number;
    headers?: Record<string, string>;
    body?: Record<string, string>;
} | null;

/**
 * Backward-compatible wrapper. Single orchestration implementation lives in
 * ExecuteWorkflowUseCase; T-130 may remove this wrapper after import migration.
 */
export async function executeWorkflow({
                                          executionId,
                                          workflowId,
                                          graph,
                                          userId
                                      }: ExecuteWorkflowType, req?: any) {

    const useCase = new ExecuteWorkflowUseCase({
        collaborators: createDefaultRuntimeCollaborators(userId, workflowId)
    });

    return useCase.execute({
        executionId,
        workflowId,
        graph,
        userId,
        request: req
    });
}
