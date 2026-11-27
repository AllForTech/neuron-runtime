import {SECRET_PREFIX} from "../constants";


export const generateSecureKey = (prefix: string = SECRET_PREFIX, bytes: number = 32): string => {
    // globalThis.crypto is the same Web Crypto provider in browsers and Node.js
    const cryptoProvider = globalThis.crypto;

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