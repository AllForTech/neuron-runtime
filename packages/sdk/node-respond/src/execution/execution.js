"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executor = void 0;
const executor = async ({ nodeType, config, input, }) => {
    const { statusCode, body, headers } = config;
    console.log("Respond Node Config received:", config);
    return {
        success: true,
        output: {
            __isTerminal: true,
            status: Number(statusCode) || 200,
            headers: {
                "Content-Type": "application/json",
                ...headers
            },
            body: body
        }
    };
};
exports.executor = executor;
