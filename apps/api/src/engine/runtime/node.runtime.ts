import { resolveTemplate } from "../resolveTemplate";
import { nodeRegistry } from "../node.registry";
import {IVaultResolver} from "@neuron/shared";

export async function resolveConfig(
    config: any,
    context: Record<string, any>,
    options: {
        variables?: Record<string, string>;
        vault?: IVaultResolver;
    }
): Promise<any> {
    // 1. Handle Strings (The actual template resolution)
    if (typeof config === "string") {
        return await resolveTemplate(config, context, options);
    }

    // 2. Handle Arrays (Recursive)
    if (Array.isArray(config)) {
        return await Promise.all(
            config.map(v => resolveConfig(v, context, options))
        );
    }

    // 3. Handle Objects (Recursive)
    if (config && typeof config === "object") {
        const result: any = {};
        for (const key of Object.keys(config)) {
            // Pass the entire options object down
            result[key] = await resolveConfig(config[key], context, options);
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