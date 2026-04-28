import { NodeExecutor, NodeExecutorContext, ExecutorOutput } from "@neuron/shared";
import { TriggerNodeConfig } from "../index.js";

export const triggerNodeExecutor: NodeExecutor = async ({
                                                 config,
                                             }: NodeExecutorContext): Promise<ExecutorOutput> => {

    const { triggerType, webhookData } = config as TriggerNodeConfig;

    if (triggerType === 'webhook' && webhookData) {
        return {
            success: true,
            output: {
                body: webhookData.body || {},
                query: webhookData.query || {},
                headers: webhookData.headers || {}
            },
        };
    }

    return {
        success: true,
        output: { message: "Triggered successfully" },
    };
};