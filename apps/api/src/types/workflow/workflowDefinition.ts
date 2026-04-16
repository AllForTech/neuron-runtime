import {WorkflowEdge, WorkflowNode} from "@neuron/db";

export type ExecuteWorkflowType = {
    runId: string;
    workflowId: string;
    graph: {
        nodes: WorkflowNode[];
        edges: WorkflowEdge[];
    },
    userId: string;
    params?: any
}