import {NodeExecutorContext} from "@neuron/shared";

export const executor = async ({
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