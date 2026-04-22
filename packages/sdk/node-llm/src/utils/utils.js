"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseZodSchema = parseZodSchema;
const zod_1 = require("zod");
function parseZodSchema(input) {
    // 1. Clean the input (remove 'z.' prefixes and whitespace for easier matching)
    // In a real scenario, you'd use a regex or a small library like 'nearley'
    // for a full parser, but this manual mapper is safest without eval.
    // For this implementation, we expect a standard object-style string:
    // "{ name: z.string(), age: z.number() }"
    try {
        // Step 1: Extract the content between the outer curly braces
        const objectBody = input.trim().replace(/^\{/, "").replace(/\}$/, "");
        // Step 2: Split by key-value pairs (using a basic comma split)
        const pairs = objectBody.split(/,(?![^()]*\))/); // Split by comma not inside parens
        const shape = {};
        pairs.forEach(pair => {
            const [key, value] = pair.split(":").map(s => s.trim());
            if (!key || !value)
                return;
            shape[key] = mapTokenToZod(value);
        });
        return zod_1.z.object(shape);
    }
    catch (e) {
        throw new Error("Failed to parse Zod schema. Please check your syntax.");
    }
}
function mapTokenToZod(token) {
    let schema = zod_1.z.string();
    // Basic Type Mapping
    if (token.includes("z.string()"))
        schema = zod_1.z.string();
    if (token.includes("z.number()"))
        schema = zod_1.z.number();
    if (token.includes("z.boolean()"))
        schema = zod_1.z.boolean();
    // Recursive Array Mapping: z.array(z.string())
    if (token.includes("z.array(")) {
        const inner = token.match(/z\.array\((.*)\)/)?.[1] || "z.string()";
        schema = zod_1.z.array(mapTokenToZod(inner));
    }
    // Modifier Mapping: .describe("...")
    if (token.includes(".describe(")) {
        const description = token.match(/\.describe\(['"](.*)['"]\)/)?.[1];
        if (description)
            schema = schema.describe(description);
    }
    // Modifier Mapping: .positive()
    if (token.includes(".positive()")) {
        if (schema instanceof zod_1.z.ZodNumber)
            schema = schema.positive();
    }
    return schema;
}
