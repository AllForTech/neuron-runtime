import {NodeExecutorContext} from "@neuron/shared";
import {RespondNodeConfig} from "../index";

export const executor = async ({
                                   nodeType,
                                   config,
                                   input,
                               }: NodeExecutorContext) => {

    const { statusCode, body, headers } = config as RespondNodeConfig;

    console.log("Respond Node Config received:", config);

    return {
        __isTerminal: true,
        status: Number(statusCode) || 200,
        headers: {
            "Content-Type": "application/json",
            ...headers
        },
        body: body
    };
}