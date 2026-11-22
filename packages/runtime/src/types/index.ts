import type {IVaultResolver, WorkflowEventSink, WorkflowVariableSource} from "@neuron/shared";

/**
 * The only node fields the engine consumes. Both persistence rows and domain
 * graph nodes satisfy this shape, so no adapter type leaks into the domain.
 */
export interface RuntimeGraphNode {
    id: string;
    type: string;
    config: any;
}

/** The only edge fields the traversal consumes. */
export interface RuntimeGraphEdge {
    id?: string;
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
    config?: any;
}

export interface IRuntime {
    nodes: RuntimeGraphNode[];
    edges: RuntimeGraphEdge[];
}

export interface GraphDefinition {
    nodes: RuntimeGraphNode[];
    edges: RuntimeGraphEdge[];
}

export interface ExecuteWorkflowType {
    workflowId: string;
    userId: string;
    executionId: string;
    graph: GraphDefinition;
    /** Injected collaborators. Production callers supply the API adapters. */
    vault?: IVaultResolver;
    variables?: WorkflowVariableSource;
    events?: WorkflowEventSink;
}

export type NodeExecutionResult =
    | { status: 'success'; data: any; error?: never; metrics: ExecutionMetrics }
    | { status: 'failed'; data: null; error: ExecutionError; metrics: ExecutionMetrics }
    | { status: 'timeout' | 'skipped'; data: null; error?: ExecutionError; metrics: ExecutionMetrics };

export interface ExecutionMetrics {
    durationMs: number;
    timestamp: string;
    memoryUsed?: number;
}

export interface ExecutionError {
    message: string;
    code: string;
    stack?: string;
}