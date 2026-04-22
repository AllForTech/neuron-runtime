"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executor = void 0;
const executor = async ({ config, }) => {
    const fields = config.fields || {};
    return {
        success: true,
        output: fields,
    };
};
exports.executor = executor;
