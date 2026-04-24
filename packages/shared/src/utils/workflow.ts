import {WorkflowEdge, BaseNode} from "../types/index.js";



export function findNode(
    nodes: BaseNode[],
    nodeId: string
): BaseNode | undefined {
    return nodes.find((node) => node.id === nodeId)
}

export function getNextNodes(  edges: WorkflowEdge[],  currentNodeId: string): string[] {
    return edges    .filter((edge) => edge.source === currentNodeId)    .map((edge) => edge.target)
}

export function findTriggerNode(
    nodes: BaseNode[]
): BaseNode | undefined {
    return nodes.find((node) => node.type.startsWith("Trigger."))
}