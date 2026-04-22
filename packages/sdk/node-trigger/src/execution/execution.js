"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executor = void 0;
const executor = async ({ config, }) => {
    const triggerData = {
        timestamp: new Date().toISOString(),
        type: config?.triggerType || "manual"
    };
    return {
        success: true,
        output: triggerData,
    };
};
exports.executor = executor;
