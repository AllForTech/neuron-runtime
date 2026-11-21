import { isIP } from "node:net";
import type { LookupFunction } from "node:net";
import { Agent } from "undici";

/**
 * Build a DNS lookup function that never consults the system resolver.
 * The original hostname is still passed to the transport so Host, TLS SNI and
 * certificate verification remain bound to the URL the caller requested.
 */
export function createPinnedLookup(addresses: readonly string[]): LookupFunction {
    const records = addresses.map((address) => {
        const family = isIP(address);
        if (family !== 4 && family !== 6) {
            throw new Error("Pinned egress target is not a valid IP address");
        }
        return { address, family };
    });

    if (records.length === 0) {
        throw new Error("No validated egress address is available for this connection");
    }

    return (_hostname, options, callback) => {
        if (options.all === true) {
            callback(null, records);
            return;
        }

        const selected = records[0]!;
        callback(null, selected.address, selected.family);
    };
}

/** Create a per-hop dispatcher whose connect lookup returns only validated addresses. */
export function createPinnedDispatcher(addresses: readonly string[]): Agent {
    return new Agent({ connect: { lookup: createPinnedLookup(addresses) } });
}
