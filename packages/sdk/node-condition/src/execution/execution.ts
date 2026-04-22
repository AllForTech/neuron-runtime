import { NodeExecutor, NodeExecutorContext, ExecutorOutput } from "@neuron/shared";
import { ConditionNodeConfig } from "../index";

export const executor: NodeExecutor = async ({
                                                 config,
                                             }: NodeExecutorContext): Promise<ExecutorOutput> => {
    const { leftValue, operator, rightValue } = config as ConditionNodeConfig;
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
}