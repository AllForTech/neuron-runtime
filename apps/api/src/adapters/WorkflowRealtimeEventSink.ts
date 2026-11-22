import {workflowBroadcast} from "@neuron/db";
import {WorkflowEditorActionType} from "@neuron/shared";
import type {DomainExecutionEvent, WorkflowEventSink} from "@neuron/shared";

/**
 * Maps domain execution events onto the frozen realtime wire contract:
 * channel `workflow_<runId>`, event `workflow_action`, payload `{ type, ... }`.
 * The existing editor action string values are reused so no UI consumer
 * changes are required.
 */
export class WorkflowRealtimeEventSink implements WorkflowEventSink {
    private readonly dispatch: (type: string, payload: Record<string, any>) => Promise<void>;

    constructor(workflowId: string) {
        this.dispatch = workflowBroadcast(workflowId).dispatch;
    }

    async emit(event: DomainExecutionEvent): Promise<void> {
        switch (event.type) {
            case "node.started":
                await this.dispatch(WorkflowEditorActionType.NODE_EXECUTION_START, {
                    nodeId: event.nodeId
                });
                return;
            case "node.succeeded":
                await this.dispatch(WorkflowEditorActionType.NODE_EXECUTION_SUCCESS, {
                    nodeId: event.nodeId,
                    output: event.output
                });
                return;
            case "node.failed":
                await this.dispatch(WorkflowEditorActionType.NODE_EXECUTION_ERROR, {
                    nodeId: event.nodeId,
                    error: event.error
                });
                return;
        }
    }
}
