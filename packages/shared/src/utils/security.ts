import {SECRET_PREFIX} from "../constants";


export const generateSecureKey = (prefix: string = SECRET_PREFIX, bytes: number = 32): string => {
    // Use globalThis to ensure compatibility across Browser and Node.js environments
    const cryptoProvider = typeof window !== 'undefined' ? window.crypto : (globalThis.crypto as any);

    if (!cryptoProvider || !cryptoProvider.getRandomValues) {
        throw new Error('Cryptographic API not available in this environment.');
    }

    const array = new Uint8Array(bytes);
    cryptoProvider.getRandomValues(array);

    // Convert bytes to hex string
    const token = Array.from(array)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

    return `${prefix}${token}`;
};