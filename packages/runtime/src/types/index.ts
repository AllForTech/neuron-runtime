import {Workflow, WorkflowEdge, WorkflowNode} from "@neuron/db";

export interface IRuntime {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
}

export interface GraphDefinition {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
}

export interface ExecuteWorkflowType {
    workflowId: string;
    userId: string;
    executionId: string;
    graph: GraphDefinition;
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