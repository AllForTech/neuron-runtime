
export const generateId = () => {
    return typeof window !== 'undefined'
        ? window.crypto.randomUUID()
        : Math.random().toString(36).substring(2, 9);
};