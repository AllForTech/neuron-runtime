import {workflowBroadcast} from "@neuron/db";
import type {DomainExecutionEvent, WorkflowEventSink} from "@neuron/shared";
import {RealtimeExecutionProjector} from "../application/projectors/realtime-execution.projector.js";

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
        const payload = RealtimeExecutionProjector.toWirePayload(event);
        if (!payload) return;
        await this.dispatch(payload.type, payload);
    }
}
