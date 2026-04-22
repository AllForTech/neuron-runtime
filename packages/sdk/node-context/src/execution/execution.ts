import { NodeExecutor, NodeExecutorContext, ExecutorOutput } from "@neuron/shared";
import { ContextNodeConfig } from "../index";

export const executor: NodeExecutor = async ({
                                                 config,
                                             }: NodeExecutorContext): Promise<ExecutorOutput> => {
    const fields = (config as ContextNodeConfig).fields || {};

    return {
        success: true,
        output: fields,
    };
}