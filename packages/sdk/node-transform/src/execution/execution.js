"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executor = void 0;
const vm2_1 = require("vm2");
function normalizeTransformCode(code) {
    const trimmed = code.trim();
    if (/return\s+/m.test(trimmed))
        return code;
    return `return (${trimmed})`;
}
const executor = async ({ config, input, }) => {
    try {
        const vm = new vm2_1.NodeVM({
            console: "redirect",
            sandbox: {
                inputs: Object.freeze(input ?? {})
            },
            timeout: 1000,
            eval: false,
            wasm: false,
            require: false,
        });
        const userCode = normalizeTransformCode(config.code);
        const wrappedCode = `
            module.exports = (function() {
                "use strict";
                try {
                    const result = (function() {
                        ${userCode}
                    })();

                    return result;
                } catch (e) {
                    return { __is_error: true, message: e.message };
                }
            })();
        `;
        const result = vm.run(wrappedCode, "transform.js");
        if (result && result.__is_error) {
            throw new Error(`User Script Error: ${result.message}`);
        }
        if (result === undefined || result === null) {
            throw new Error("Transform must return a value.");
        }
        return {
            success: true,
            output: result,
        };
    }
    catch (error) {
        const message = error.message.includes("Script execution timed out")
            ? "Execution Timeout: Transformation took too long."
            : error.message;
        throw new Error(message);
    }
};
exports.executor = executor;
