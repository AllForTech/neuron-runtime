
export const generateId = () => {
    const cryptoProvider = globalThis.crypto;
    return typeof cryptoProvider?.randomUUID === 'function'
        ? cryptoProvider.randomUUID()
        : Math.random().toString(36).substring(2, 9);
};