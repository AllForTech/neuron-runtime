import {NodeExecutor, NodeExecutorContext, transformToObject} from "@neuron/shared";
import {RespondNodeConfig} from "../index.js";

export const respondNodeExecutor: NodeExecutor = async ({
                                   nodeType,
                                   config,
                                   input,
                               }: NodeExecutorContext) => {

    const { statusCode, body, headers } = config as RespondNodeConfig;

    const formattedHeaders = transformToObject(headers, { isHeader: true });

    console.log("Respond Node Config received:", config);

    return {
        success: true,
        output: {
            __isTerminal: true,
            status: Number(statusCode) || 200,
            headers: {
                "Content-Type": "application/json",
                ...formattedHeaders
            },
            body: body
        }
    };
}