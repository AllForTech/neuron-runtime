import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm'],
    outExtension() {
        return {
            js: '.js',
        };
    },
    dts: {
        resolve: true,
    },
    clean: true,
    shims: true,
    // isolated-vm ships a native .node addon that esbuild cannot bundle;
    // keep it as a runtime require resolved from the installed dependency.
    external: ['isolated-vm'],
    noExternal: ['@neuron/shared', '@neuron/db', '@neuron/auth', '@neuron/runtime'],
});