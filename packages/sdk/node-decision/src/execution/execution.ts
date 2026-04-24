import { NodeExecutor, NodeExecutorContext, ExecutorOutput } from "@neuron/shared";
import { DecisionNodeConfig } from "../index.js";

export const executor: NodeExecutor = async ({
                                                 config,
                                             }: NodeExecutorContext): Promise<ExecutorOutput> => {

    const { input, rules, inputTransforms = [] } = config as DecisionNodeConfig;

    const runTransform = (val: any, list: string[]) => {
        let res = val;
        if (list.includes("toString")) res = String(res ?? "");
        if (list.includes("toLowerCase")) res = String(res).toLowerCase();
        if (list.includes("toUpperCase")) res = String(res).toUpperCase();
        if (list.includes("trim")) res = String(res).trim();
        if (list.includes("toNumber")) res = Number(res);
        return res;
    };

    const globalInput = runTransform(input, inputTransforms);

    const matchedRuleIds = rules
        .filter((rule) => {
            const { operator, value, transforms = [] } = rule;
            const finalValue = runTransform(value, transforms);

            switch (operator) {
                case "==": return globalInput === finalValue;
                case "!=": return globalInput !== finalValue;
                case ">":  return Number(globalInput) > Number(finalValue);
                case "<":  return Number(globalInput) < Number(finalValue);
                case "includes": return String(globalInput).includes(String(finalValue));
                case "exists": return input !== undefined && input !== null;
                default: return false;
            }
        })
        .map((rule) => rule.id);

    const output = matchedRuleIds.length > 0 ? matchedRuleIds : ["default-else"];

    return {
        success: true,
        output,
    };
}