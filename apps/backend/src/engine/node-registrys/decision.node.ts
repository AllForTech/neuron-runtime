import { DecisionNode } from "@neuron/shared";


export const decisionNodeExecutor = async ({ node }: { node: DecisionNode }) => {
    const { input, rules, inputTransforms = [] } = node.config;

    const runTransform = (val: any, list: string[]) => {
        let res = val;
        if (list.includes("toString")) res = String(res ?? "");
        if (list.includes("toLowerCase")) res = String(res).toLowerCase();
        if (list.includes("toUpperCase")) res = String(res).toUpperCase();
        if (list.includes("trim")) res = String(res).trim();
        if (list.includes("toNumber")) res = Number(res);
        return res;
    };

    // 1. Initial global processing
    const globalInput = runTransform(input, inputTransforms);

    // 2. Evaluate rules
    const matchedRuleIds = rules
        .filter((rule) => {
            const { operator, value, transforms = [] } = rule;

            // Apply rule-specific logic to both sides
            // const finalInput = runTransform(globalInput, transforms);
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

    return matchedRuleIds.length > 0 ? matchedRuleIds : ["default-else"];
};