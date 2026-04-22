import { NodeExecutor, NodeExecutorContext, ExecutorOutput } from "@neuron/shared";
import { TriggerNodeConfig } from "../index";

export const executor: NodeExecutor = async ({
                                                 config,
                                             }: NodeExecutorContext): Promise<ExecutorOutput> => {

    const triggerData = {
        timestamp: new Date().toISOString(),
        type: (config as TriggerNodeConfig)?.triggerType || "manual"
    };

    return {
        success: true,
        output: triggerData,
    };
};