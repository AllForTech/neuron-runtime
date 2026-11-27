import {WorkflowEditorActionType} from "@neuron/shared";
import type {DomainExecutionEvent} from "@neuron/shared";

export type RealtimeWireFrame = {
    type: string;
    nodeId: string;
    output?: any;
    error?: any;
};

/**
 * Projects domain execution events to the frozen realtime wire payload.
 * Channel/event transport remains in the adapter; this projector owns the
 * payload shape and literal NODE_EXECUTION_* strings.
 */
export class RealtimeExecutionProjector {
    static toWirePayload(event: DomainExecutionEvent): RealtimeWireFrame | null {
        switch (event.type) {
            case "node.started":
                return {
                    type: WorkflowEditorActionType.NODE_EXECUTION_START,
                    nodeId: event.nodeId
                };
            case "node.succeeded":
                return {
                    type: WorkflowEditorActionType.NODE_EXECUTION_SUCCESS,
                    nodeId: event.nodeId,
                    output: event.output
                };
            case "node.failed":
                return {
                    type: WorkflowEditorActionType.NODE_EXECUTION_ERROR,
                    nodeId: event.nodeId,
                    error: event.error
                };
            default:
                return null;
        }
    }
}
