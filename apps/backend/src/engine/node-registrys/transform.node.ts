import ivm from "isolated-vm";
import {TransformNode} from "@neuron/shared";

export const transformNodeExecutor =  async ({ node, inputs }: { node: TransformNode, inputs: any }) => {
    const isolate = new ivm.Isolate({ memoryLimit: 128 });

    try {
        const context = await isolate.createContext();
        const jail = context.global;

        // 3. Securely pass your 'inputs' into the sandbox
        // ExternalCopy prevents the sandbox from touching your actual backend objects
        await jail.set('inputs', new ivm.ExternalCopy(inputs).copyInto());

        // 4. Compile the user code
        // We wrap it to ensure 'return' works as expected
        const script = await isolate.compileScript(`
            (function() {
                "use strict";
                ${node.config.code}
            })()
        `);

        // 5. Run with a strict 1-second CPU timeout
        const result = await script.run(context, { timeout: 1000 });

        if (result === undefined) {
            throw new Error("Transform must return a value (e.g., 'return inputs.data')");
        }

        return result;

    } catch (error: any) {
        // Catch infinite loops or syntax errors
        const message = error.message === 'Script execution timed out.'
            ? "Execution Timeout: Code took too long to run."
            : `JS Error: ${error.message}`;
        throw new Error(message);
    } finally {
        // 6. CRITICAL: Cleanup memory or your backend will crash after a few runs
        isolate.dispose();
    }
}