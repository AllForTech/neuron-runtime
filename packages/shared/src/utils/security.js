"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUrl = validateUrl;
require("server-only");
// @ts-ignore
const promises_1 = __importDefault(require("dns/promises"));
// @ts-ignore
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Robust CIDR or prefix check for private ranges
const PRIVATE_RANGES = [
    /^10\./,
    /^127\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^169\.254\./, // Link-local (Cloud Metadata APIs)
    /^::1$/, // IPv6 Loopback
    /^fe80:/ // IPv6 Link-local
];
async function validateUrl(url) {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        throw new Error("Invalid protocol: only HTTP/HTTPS allowed");
    }
    const hostname = parsed.hostname;
    // Resolve DNS (Forces IPv4 for consistency with your check)
    const { address } = await promises_1.default.lookup(hostname, { family: 4 });
    // Block Private/Internal IPs
    if (isPrivateIP(address)) {
        throw new Error(`Access to internal IP ${address} is forbidden`);
    }
    return { address, url };
}
function isPrivateIP(ip) {
    return PRIVATE_RANGES.some(range => range.test(ip));
}
function getUserIdFromToken(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.SUPABASE_JWT_SECRET);
        return decoded.sub; // Supabase user id
    }
    catch {
        return null;
    }
}
