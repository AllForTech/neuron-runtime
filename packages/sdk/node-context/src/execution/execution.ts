import {NodeExecutorContext} from "@neuron/shared";
import {ContextNodeConfig} from "../index";

export const executor = async ({
                                   nodeType,
                                   config,
                                   input,
                               }: NodeExecutorContext) => {

    return (config as ContextNodeConfig).fields || {};
}