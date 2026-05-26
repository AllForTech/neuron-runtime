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
    noExternal: ['@neuron/shared', '@neuron/db', '@neuron/auth', '@neuron/runtime'],
});