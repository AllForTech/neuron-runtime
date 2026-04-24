import {WorkflowNode} from "./nodes.js";
import {WorkflowEdge} from "./edges.js";

export type ExecutionStatus = "pending" | "running" | "success" | "failed";

export interface WorkflowDefinition {
    nodes: Record<string, WorkflowNode>
    edges: Record<string, WorkflowEdge>
}