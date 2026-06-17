import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';
export { SECRET_PREFIX } from "../constants";

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

/**
 * Helper to hydrate and validate the key from the environment
 */
const getEncryptionKey = (): Buffer => {
    const rawKey = process.env.ENCRYPTION_KEY;

    if (!rawKey) {
        throw new Error('ENCRYPTION_KEY is missing from environment variables.');
    }

    // Convert hex string to 32 bytes.
    // If your key is 64 hex chars, this Buffer will have a length of 32.
    const keyBuffer = Buffer.from(rawKey, 'hex');

    if (keyBuffer.length !== 32) {
        throw new Error(`Invalid Key Length: AES-256 requires 32 bytes. Your key provides ${keyBuffer.length} bytes.`);
    }

    return keyBuffer;
};

export function encryptSecret(text: string): string {
    const key = getEncryptionKey();
    const iv = randomBytes(IV_LENGTH);

    const cipher = createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    // Return as iv:tag:content
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptSecret(hash: string): string {
    const key = getEncryptionKey();

    const [ivPart, authTagPart, encryptedPart] = hash.split(':');

    if (!ivPart || !authTagPart || !encryptedPart) {
        throw new Error('Invalid encryption format: Missing IV, AuthTag, or Content.');
    }

    const iv = Buffer.from(ivPart, 'hex');
    const authTag = Buffer.from(authTagPart, 'hex');

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedPart, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

export async function getWorkflowSecret(deployment: any) {
    if (!deployment.secretKey) return null;
    try {
        return decryptSecret(deployment.secretKey);
    } catch (e) {
        console.error("Integrity check failed: Secret key might be tampered with or ENCRYPTION_KEY changed.");
        return null;
    }
}
