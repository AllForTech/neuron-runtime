import { NodeExecutor, NodeExecutorContext, ExecutorOutput } from "@neuron/shared";
import { ContextNodeConfig } from "../index.js";

export const contextNodeExecutor: NodeExecutor = async ({
                                                 config,
                                             }: NodeExecutorContext): Promise<ExecutorOutput> => {
    const fields = (config as ContextNodeConfig).fields || {};

    return {
        success: true,
        output: fields,
    };
}