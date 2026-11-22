import type {IVaultResolver, WorkflowEventSink, WorkflowVariableSource} from "@neuron/shared";
import {DbVaultResolver} from "./DbVaultResolver.js";
import {DbWorkflowVariableSource} from "./DbWorkflowVariableSource.js";
import {WorkflowRealtimeEventSink} from "./WorkflowRealtimeEventSink.js";

export interface RuntimeCollaborators {
    vault: IVaultResolver;
    variables: WorkflowVariableSource;
    events: WorkflowEventSink;
}

/**
 * The concrete collaborators used by today's execution wrapper. They are
 * injected into Runtime so the engine stays free of persistence imports;
 * T-112 will move this composition to the application use-case.
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
