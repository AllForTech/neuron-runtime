/**
 * A domain-level execution event emitted by the engine.
 *
 * `output` and `error` intentionally carry the raw engine values so adapters
 * can reproduce the frozen realtime payloads without changing the engine.
 */
export type DomainExecutionEvent =
    | { type: "node.started"; nodeId: string }
    | { type: "node.succeeded"; nodeId: string; output?: any }
    | { type: "node.failed"; nodeId: string; error?: any };

/**
 * Receives execution events from the engine. Transport/channel concerns belong
 * to the adapter, not the domain.
 */
export interface WorkflowEventSink {
    emit(event: DomainExecutionEvent): Promise<void>;
}
