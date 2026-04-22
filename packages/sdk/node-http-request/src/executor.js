"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executor = void 0;
const executor = async ({ config, }) => {
    const { url, method, headers = {}, body } = config;
    const finalBody = typeof body === 'object' ? JSON.stringify(body) : body;
    const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...headers },
        body: method !== "GET" ? finalBody : undefined
    });
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    return {
        success: true,
        output: data,
    };
};
exports.executor = executor;
