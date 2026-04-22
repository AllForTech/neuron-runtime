"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executor = void 0;
const executor = async ({ config, }) => {
    const { leftValue, operator, rightValue } = config;
    let result = false;
    switch (operator) {
        case "==":
            result = leftValue == rightValue;
            break;
        case "!=":
            result = leftValue != rightValue;
            break;
        case ">":
            result = Number(leftValue) > Number(rightValue);
            break;
        case "<":
            result = Number(leftValue) < Number(rightValue);
            break;
        case "exists":
            result = leftValue !== undefined && leftValue !== null;
            break;
        default:
            result = false;
    }
    return {
        success: true,
        output: result,
    };
};
exports.executor = executor;
