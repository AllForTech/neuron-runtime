"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.decrypt = decrypt;
require("server-only");
// @ts-ignore
const crypto_1 = __importDefault(require("crypto"));
const algorithm = "aes-256-gcm";
function encrypt(secret, text) {
    const key = crypto_1.default.createHash("sha256")
        .update(secret)
        .digest();
    const iv = crypto_1.default.randomBytes(16);
    const cipher = crypto_1.default.createCipheriv(algorithm, key, iv);
    const encrypted = Buffer.concat([
        cipher.update(text, "utf8"),
        cipher.final()
    ]);
    const tag = cipher.getAuthTag();
    return {
        content: encrypted.toString("hex"),
        iv: iv.toString("hex"),
        tag: tag.toString("hex")
    };
}
function decrypt(secret, payload) {
    const key = crypto_1.default.createHash("sha256")
        .update(secret)
        .digest();
    const decipher = crypto_1.default.createDecipheriv(algorithm, key, Buffer.from(payload.iv, "hex"));
    decipher.setAuthTag(Buffer.from(payload.tag, "hex"));
    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(payload.content, "hex")),
        decipher.final()
    ]);
    return decrypted.toString("utf8");
}
