import {WorkflowNode} from "./nodes";
import {WorkflowEdge} from "./edges";

export interface WorkflowDefinition {
    nodes: Record<string, WorkflowNode>
    edges: Record<string, WorkflowEdge>
}