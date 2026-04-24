import {WorkflowEdge} from "../types/index.js";

export function convertEdgeToDBSchema(edge: WorkflowEdge) {
    return {
        id: edge.id,
        config: edge.config ?? {},
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle as string ?? edge.id,
        targetHandle: edge.targetHandle as string ?? edge.id,
    }
}