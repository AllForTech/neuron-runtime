import {NodeExecutorContext} from "@neuron/shared";

export const debugNodeExecutor = async ({
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