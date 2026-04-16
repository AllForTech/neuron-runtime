import {WorkflowNode} from "./nodes";
import {WorkflowEdge} from "./edges";

export type ExecutionStatus = "pending" | "running" | "success" | "failed";

export interface WorkflowDefinition {
    nodes: Record<string, WorkflowNode>
    edges: Record<string, WorkflowEdge>
}