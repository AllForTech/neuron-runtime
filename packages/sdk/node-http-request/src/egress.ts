import { lookup as dnsLookup } from "node:dns/promises";
import { isIP } from "node:net";

export type AddressResolver = (hostname: string) => Promise<string[]>;

const FORBIDDEN_IPV4: ReadonlyArray<readonly [string, number]> = [
    ["0.0.0.0", 8],
    ["10.0.0.0", 8],
    ["100.64.0.0", 10],
    ["127.0.0.0", 8],
    ["169.254.0.0", 16],
    ["172.16.0.0", 12],
    ["192.0.0.0", 24],
    ["192.0.2.0", 24],
    ["192.88.99.0", 24],
    ["192.168.0.0", 16],
    ["198.18.0.0", 15],
    ["198.51.100.0", 24],
    ["203.0.113.0", 24],
    ["224.0.0.0", 4],
    ["240.0.0.0", 4],
];

const FORBIDDEN_IPV6: ReadonlyArray<readonly [string, number]> = [
    ["::", 96],
    ["::ffff:0:0", 96],
    ["fc00::", 7],
    ["fe80::", 10],
    ["ff00::", 8],
    ["2001:db8::", 32],
    ["64:ff9b::", 96],
    ["2002::", 16],
];

const BLOCKED_EGRESS_MESSAGE =
    "HTTP node egress to private, loopback, link-local or reserved networks is not allowed";

function ipv4ToInt(address: string): number | null {
    const octets = address.split(".").map(Number);
    if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
        return null;
    }
    return ((octets[0]! << 24) | (octets[1]! << 16) | (octets[2]! << 8) | octets[3]!) >>> 0;
}

function matchesIpv4Cidr(address: number, base: string, prefixBits: number): boolean {
    const baseInt = ipv4ToInt(base)!;
    const mask = prefixBits === 0 ? 0 : (0xffffffff << (32 - prefixBits)) >>> 0;
    return (address & mask) === (baseInt & mask);
}

function isPublicIpv4(address: string): boolean {
    const value = ipv4ToInt(address);
    if (value === null) return false;
    return !FORBIDDEN_IPV4.some(([base, prefixBits]) => matchesIpv4Cidr(value, base, prefixBits));
}

/** Expand an IPv6 address into eight four-digit groups (no BigInt dependency). */
function parseIpv6(address: string): string[] | null {
    let value = address.trim().toLowerCase().replace(/^\[|\]$/g, "").split("%")[0]!;

    const lastColon = value.lastIndexOf(":");
    const tail = value.slice(lastColon + 1);
    if (tail.includes(".")) {
        const octets = tail.split(".").map(Number);
        if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
            return null;
        }
        const high = ((octets[0]! << 8) | octets[1]!).toString(16).padStart(4, "0");
        const low = ((octets[2]! << 8) | octets[3]!).toString(16).padStart(4, "0");
        value = `${value.slice(0, lastColon + 1)}${high}:${low}`;
    }

    const parts = value.split("::");
    if (parts.length > 2) return null;

    const left = parts[0] ? parts[0].split(":") : [];
    const right = parts[1] ? parts[1].split(":") : [];
    if ([...left, ...right].some((group) => !/^[0-9a-f]{1,4}$/.test(group))) return null;

    const missing = 8 - left.length - right.length;
    if (parts.length === 1 && missing !== 0) return null;
    if (parts.length === 2 && missing < 1) return null;

    const groups = [...left, ...Array<string>(missing).fill("0"), ...right];
    return groups.length === 8 ? groups.map((group) => group.padStart(4, "0")) : null;
}

function matchesIpv6Prefix(groups: string[], base: string[], prefixBits: number): boolean {
    const wholeGroups = Math.floor(prefixBits / 16);
    for (let index = 0; index < wholeGroups; index += 1) {
        if (groups[index] !== base[index]) return false;
    }

    const remainder = prefixBits % 16;
    if (remainder) {
        const mask = (0xffff << (16 - remainder)) & 0xffff;
        const group = parseInt(groups[wholeGroups]!, 16);
        const baseGroup = parseInt(base[wholeGroups]!, 16);
        if ((group & mask) !== (baseGroup & mask)) return false;
    }

    return true;
}

function isPublicIpv6(address: string): boolean {
    const groups = parseIpv6(address);
    if (!groups) return false;

    for (const [base, prefixBits] of FORBIDDEN_IPV6) {
        const baseGroups = parseIpv6(base)!;
        if (!matchesIpv6Prefix(groups, baseGroups, prefixBits)) continue;

        if (base === "::ffff:0:0") {
            const high = parseInt(groups[6]!, 16);
            const low = parseInt(groups[7]!, 16);
            const mapped = `${(high >> 8) & 0xff}.${high & 0xff}.${(low >> 8) & 0xff}.${low & 0xff}`;
            return isPublicIpv4(mapped);
        }
        return false;
    }

    return true;
}

/** True only for globally routable IPv4/IPv6 literals. */
export function isPublicAddress(address: string): boolean {
    const version = isIP(address);
    if (version === 4) return isPublicIpv4(address);
    if (version === 6) return isPublicIpv6(address);
    return false;
}

const resolveAddresses: AddressResolver = async (hostname) => {
    const records = await dnsLookup(hostname, { all: true, verbatim: true });
    return records.map((record) => record.address);
};

export type PublicHttpTarget = {
    /** Original URL; its hostname must be kept for Host, SNI and certificate checks. */
    url: URL;
    /** Every address that was validated and is safe to use for the connection. */
    addresses: string[];
};

/**
 * Validate an HTTP node target before a request is issued. Every resolved
 * address must be public so a host with a private record cannot be selected
 * by the fetch implementation. Returning the addresses lets the transport pin
 * the connection to exactly what was validated.
 */
export async function resolvePublicHttpTarget(
    rawUrl: string,
    resolve: AddressResolver = resolveAddresses,
): Promise<PublicHttpTarget> {
    let url: URL;
    try {
        url = new URL(rawUrl);
    } catch {
        throw new Error("Invalid URL provided to the HTTP node");
    }

    if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error("HTTP node only supports http and https protocols");
    }

    const hostname = url.hostname.replace(/^\[|\]$/g, "");
    if (!hostname) {
        throw new Error("Invalid URL provided to the HTTP node");
    }

    if (isIP(hostname)) {
        if (!isPublicAddress(hostname)) throw new Error(BLOCKED_EGRESS_MESSAGE);
        return { url, addresses: [hostname] };
    }

    const addresses = await resolve(hostname);
    if (addresses.length === 0) {
        throw new Error("Unable to resolve HTTP node target host");
    }
    if (!addresses.every((address) => isPublicAddress(address))) {
        throw new Error(BLOCKED_EGRESS_MESSAGE);
    }

    return { url, addresses };
}

/** URL-only compatibility wrapper for callers that do not need pinning addresses. */
export async function assertPublicHttpUrl(
    rawUrl: string,
    resolve: AddressResolver = resolveAddresses,
): Promise<URL> {
    return (await resolvePublicHttpTarget(rawUrl, resolve)).url;
}
