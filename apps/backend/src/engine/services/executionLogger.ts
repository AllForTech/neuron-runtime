import { createExecutionLog, updateExecutionLog } from "../../services/repository/execution.logs.repository";
import {workflowRuntimeBroadcast} from "../../services/supabase/supabase.services";
import {RuntimeActionType} from "../../types/types";

const executionOrderMap = new Map<string, number>();

export async function logNodeExecutionStart({
                                                runId,
                                                nodeId,
                                                input,
                                                userId,
    workflowId,
    nodeLabel = "",
    nodeType
                                            }: {
    runId: string;
    nodeId: string;
    input: any;
    userId: string;
    nodeType: string;
    workflowId: string;
    nodeLabel: string;
}) {
    // Track execution order per run
    const currentOrder = executionOrderMap.get(runId) || 0;
    executionOrderMap.set(runId, currentOrder + 1);

    try {
        const { dispatch } = workflowRuntimeBroadcast(workflowId);

        const log = await createExecutionLog({
            executionId: runId,
            userId,
            nodeId,
            status: "running",
            input,
            output: null,
            error: null,
            durationMs: null,
            order: currentOrder,
            startedAt: new Date(),
            finishedAt: null,
            workflowId,
            nodeType,
            nodeLabel
        });


        await dispatch(RuntimeActionType.ADD_LOG, {
            payload: log
        });

        await dispatch(RuntimeActionType.SET_NODE_STATUS, {
            nodeId: nodeId,
            status: "running"
        });

        return log.id;
    }catch (e) {
        console.log("[Neuron]: ", e);
        throw e;
    }
}

export async function logNodeExecutionEnd({
                                              logId,
                                              output,
                                              error,
                                              duration
                                          }: {
    logId: string;
    output?: any;
    error?: string;
    duration: number;
}) {

    try {

        return await updateExecutionLog(logId, {
            status: error ? "error" : "success",
            output: output ?? null,
            error: error ?? null,
            durationMs: Math.round(duration) ?? null,
            finishedAt: new Date()
        });
    }catch (e) {
        console.log("[Neuron]: ", e);
        throw e;
    }
}