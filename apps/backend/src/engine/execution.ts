import {workflowBroadcast} from "../services/supabase/supabase.services";
import {WorkflowEditorActionType} from "../constant";
import {nodeRegistry} from "./node.registry";
import {getGlobalVariables} from "../services/repository/global.variables.repository";
import {resolveTemplate} from "./resolveTemplate";
import {WorkflowNode, WorkflowEdge} from "../types/workflow/workflow.types";
import {createContextEntry} from "../utils/telemetry";
import {executeNodeRuntime, resolveConfig} from "./runtime/node.runtime";
import {logNodeExecutionEnd, logNodeExecutionStart} from "./services/executionLogger";
import {resolveNextNodes} from "./runtime/branching";

export type FinalResponseType = {
    status: number;
    headers?: Record<string, string>;
    body?: Record<string, string>;
} | null;


export async function executeWorkflow(
    runId: string,
    workflowId: string,
    graph: {
        nodes: WorkflowNode[],
        edges: WorkflowEdge[],
    },
    userId?:  string
) {
    const { nodes, edges } = graph;
    const { dispatch } = workflowBroadcast(workflowId);

    const contextNode: Record<string, any> = {}; // for storing the output data of nodes
    const nodesContext: Record<string, any> = {};
    const globalVariables: Record<string, string> = {};
    const completed = new Set<string>();
    const running = new Set<string>();
    const validNodeIds = new Set(nodes.map(n => n.id));
    const incoming: Record<string, string[]> = {};
    const outgoing: Record<string, string[]> = {}

    // --- NEW: THE RESPONSE CONTAINER ---
    let finalResponse: Record<string, any> | null = null;

    // 1. Fetch and Map Global Variables correctly (By KEY, not ID)
    const dbVariables = await getGlobalVariables(workflowId);
    if (dbVariables) {
        for (const variable of dbVariables) {
            globalVariables[variable.key] = variable.value as string;
        }
    }

    // 2. Pre-build Adjacency Maps for performance
    for (const node of nodes) {
        incoming[node.id] = [];
        outgoing[node.id] = [];

        if (node.type.includes("contextNode")) contextNode.isPresent = true;
    }

    edges.forEach(e => {
        if (validNodeIds.has(e.source) && validNodeIds.has(e.target)) {
            incoming[e.target]!.push(e.source);
            outgoing[e.source]!.push(e.target);
        } else {
            console.warn(`[Executor] Skipping orphaned edge: ${e.source} -> ${e.target}`);
        }
    });

    const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

    async function runNode(nodeId: string) {
        if (completed.has(nodeId) || running.has(nodeId)) return;

        const node = nodeMap[nodeId] as any;
        if (!node) throw new Error(`No node found with ID: ${nodeId}`);

        running.add(nodeId);

        await dispatch(WorkflowEditorActionType.NODE_EXECUTION_START, { nodeId });

        let logId: string | null = null;

        try {
            const resolvedConfig = await resolveConfig(
                node.config,
                nodesContext,
                globalVariables
            );

            const parentInput = nodesContext[incoming[nodeId]?.[0]];

            logId = await logNodeExecutionStart({
                runId,
                nodeId,
                input: resolvedConfig,
                userId,
                workflowId,
                nodeType: node.type,
                nodeLabel: node.config?.meta?.label ?? "",
            });

            const { output, duration, startTime } =
                await executeNodeRuntime({
                    node,
                    resolvedConfig,
                    input: parentInput
                });

            // TERMINAL RESPONSE (unchanged)
            if (output && output.__isTerminal) {
                finalResponse = {
                    status: output.status,
                    headers: output.headers,
                    body: resolvedConfig.attachContext
                        ? {
                            ...output.body,
                            context: contextNode
                        }
                        : output.body,
                };
            }

            // CONTEXT PERSIST (unchanged)
            if (resolvedConfig.persistToContext && contextNode.isPresent) {
                contextNode[nodeId] = createContextEntry(node, output, startTime);
            }

            // SAVE OUTPUT
            nodesContext[nodeId] = output;
            completed.add(nodeId);

            await dispatch(WorkflowEditorActionType.NODE_EXECUTION_SUCCESS, {
                nodeId,
                output
            });

            // LOGGING
            await logNodeExecutionEnd({
                logId,
                output,
                duration
            });

            // NEXT NODES
            const nextNodeIds = resolveNextNodes({
                node,
                output,
                edges,
                outgoing
            });

            const readyNodes = nextNodeIds.filter(id =>
                incoming[id].every(parentId => completed.has(parentId))
            );

            await Promise.all(readyNodes.map(runNode));

        } catch (e: any) {
            await dispatch(WorkflowEditorActionType.NODE_EXECUTION_ERROR, {
                nodeId,
                error: e.message
            });

           if (logId){
               await logNodeExecutionEnd({
                   logId,
                   error: e.message,
                   duration: 0
               });
           }

        } finally {
            running.delete(nodeId);
        }
    }

    // Execute root nodes (those with zero dependencies)
    const startNodes = nodes.filter(n => incoming[n.id]!.length === 0).map(n => n.id);
    await Promise.all(startNodes.map(runNode));

    console.log("[Neuron]: Final data from context node:", contextNode);
    return {
        nodesContext,
        globalVariables,
        response: finalResponse as FinalResponseType
    };
}