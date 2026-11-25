import type {RuntimeCollaborators} from "../application/execute-workflow.use-case.js";
import {DbVaultResolver} from "./DbVaultResolver.js";
import {DbWorkflowVariableSource} from "./DbWorkflowVariableSource.js";
import {WorkflowRealtimeEventSink} from "./WorkflowRealtimeEventSink.js";

/**
 * Concrete collaborators injected by the engine wrapper into the application
 * use-case, keeping the engine free of persistence imports.
 */
export function createDefaultRuntimeCollaborators(
    userId: string,
    workflowId: string
): RuntimeCollaborators {
    return {
        vault: new DbVaultResolver(userId),
        variables: new DbWorkflowVariableSource(),
        events: new WorkflowRealtimeEventSink(workflowId)
    };
}
