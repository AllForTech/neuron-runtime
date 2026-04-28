import {NodeExecutorContext} from "@neuron/shared";

export const integrationNodeExecutor = async ({
                                   nodeType,
                                   config,
                                   input,
                               }: NodeExecutorContext) => {

    return {
        success: true,
        error: null,
        output: {}
    }
}