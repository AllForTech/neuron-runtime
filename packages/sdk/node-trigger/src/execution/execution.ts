import {NodeExecutorContext} from "@neuron/shared";
import {TriggerNodeConfig} from "../index";

export const executor = async ({
                                   nodeType,
                                   config,
                                   input,
                               }: NodeExecutorContext) => {

    return {
        timestamp: new Date().toISOString(),
        type: (config as TriggerNodeConfig)?.triggerType || "manual"
    }
}