import {NodeExecutorContext} from "@neuron/shared";
import {ConditionNodeConfig} from "../index";

export const executor = async ({
                                   nodeType,
                                   config,
                                   input,
                               }: NodeExecutorContext) => {

    const { leftValue, operator, rightValue } = config as ConditionNodeConfig;
    switch (operator) {
        case "==": return leftValue == rightValue;
        case "!=": return leftValue != rightValue;
        case ">":  return Number(leftValue) > Number(rightValue);
        case "<":  return Number(leftValue) < Number(rightValue);
        case "exists": return leftValue !== undefined && leftValue !== null;
        default: return false;
    }
}