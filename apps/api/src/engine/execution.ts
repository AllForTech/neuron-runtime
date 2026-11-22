import {logger, NODE_KIND} from "@neuron/shared";
import {ExecuteWorkflowType, Runtime} from "@neuron/runtime";
import {createDefaultRuntimeCollaborators} from "../adapters/index.js";
import {sanitizeWebhookData} from "../schemas/webhook-data";

export type FinalResponseType = {
    status: number;
    headers?: Record<string, string>;
    body?: Record<string, string>;
} | null;



export async function executeWorkflow({
                                          executionId,
                                          workflowId,
                                          graph,
                                          userId
                                      }: ExecuteWorkflowType, req?: any) {

    const triggerNode = graph.nodes.find(n => n.type === NODE_KIND.TRIGGER_WEBHOOK);

    if (triggerNode) {
        (triggerNode.config as any).webhookData = sanitizeWebhookData(req);
    }

    const runtime = new Runtime({
        executionId,
        workflowId,
        graph,
        userId,
        ...createDefaultRuntimeCollaborators(userId, workflowId)
    });

    const result = await runtime.execute();

    logger.info("Runtime", `Execution Result for ${executionId}`, {
        workflowId,
        status: result
    });

    return result;
}