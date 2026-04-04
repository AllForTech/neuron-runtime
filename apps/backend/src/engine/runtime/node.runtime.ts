import { resolveTemplate } from "../resolveTemplate";
import { nodeRegistry } from "../node.registry";

export async function resolveConfig(
    config: any,
    context: Record<string, any>,
    variables?: Record<string, string>
): Promise<any> {
    if (typeof config === "string") {
        return await resolveTemplate(config, context, variables);
    }

    if (Array.isArray(config)) {
        return await Promise.all(config.map(v => resolveConfig(v, context, variables)));
    }

    if (config && typeof config === "object") {
        const result: any = {};
        for (const key of Object.keys(config)) {
            result[key] = await resolveConfig(config[key], context, variables);
        }
        return result;
    }

    return config;
}

export async function executeNodeRuntime({
                                             node,
                                             input,
    resolvedConfig,
                                         }: {
    node: any;
    resolvedConfig: Record<string, any>;
    input: any;
}) {
    const startTime = performance.now();

    const executor = nodeRegistry[node.type];
    if (!executor) {
        throw new Error(`No executor found for type: ${node.type}`);
    }

    const output = await executor({
        node: { ...node, config: resolvedConfig },
        inputs: input,
    });

    const duration = performance.now() - startTime;

    return {
        output,
        duration,
        startTime
    };
}