import { beforeEach, describe, expect, it, vi } from "vitest";
import { Agent } from "undici";
import {
    assertPublicHttpUrl,
    isPublicAddress,
    resolvePublicHttpTarget,
} from "../../../packages/sdk/node-http-request/src/egress";
import {
    createPinnedDispatcher,
    createPinnedLookup,
} from "../../../packages/sdk/node-http-request/src/pinned-dispatcher";
import { httpNodeExecutor } from "../../../packages/sdk/node-http-request/src/executor";

const dnsMock = vi.hoisted(() => ({
    addresses: ["93.184.216.34"],
    lookup: vi.fn(async () => [] as Array<{ address: string }>),
}));
const undiciMock = vi.hoisted(() => ({ fetch: vi.fn() }));

vi.mock("node:dns/promises", () => ({
    lookup: dnsMock.lookup,
}));
vi.mock("undici", async (importOriginal) => {
    const actual = await importOriginal<typeof import("undici")>();
    return { ...actual, fetch: undiciMock.fetch };
});

vi.mock("@neuron/shared", () => ({
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    transformToObject: (value: unknown) => value ?? {},
}));

const PRIVATE_ADDRESSES = [
    "0.0.0.0",
    "10.0.0.1",
    "100.64.0.1",
    "127.0.0.1",
    "127.1.2.3",
    "169.254.169.254",
    "172.16.0.1",
    "172.31.255.255",
    "192.0.2.1",
    "192.168.1.1",
    "198.18.0.1",
    "224.0.0.1",
    "240.0.0.1",
    "255.255.255.255",
];

const PRIVATE_IPV6 = [
    "::",
    "::1",
    "fc00::1",
    "fd12:3456::1",
    "fe80::1",
    "ff02::1",
    "2001:db8::1",
    "::ffff:127.0.0.1",
    "::ffff:10.0.0.1",
    "::192.168.1.1",
    "64:ff9b::a00:1",
];

const PUBLIC_ADDRESSES = ["8.8.8.8", "1.1.1.1", "93.184.216.34", "172.32.0.1", "11.0.0.1"];
const PUBLIC_IPV6 = ["2606:4700:4700::1111", "2001:4860:4860::8888"];

describe("HTTP node egress address policy", () => {
    it("rejects IPv4 loopback, private, link-local, metadata and reserved ranges", () => {
        for (const address of PRIVATE_ADDRESSES) {
            expect(isPublicAddress(address), `expected ${address} to be blocked`).toBe(false);
        }
    });

    it("rejects IPv6 loopback, unique-local, link-local, multicast and mapped-private ranges", () => {
        for (const address of PRIVATE_IPV6) {
            expect(isPublicAddress(address), `expected ${address} to be blocked`).toBe(false);
        }
    });

    it("allows legitimate public IPv4 and IPv6 addresses", () => {
        for (const address of [...PUBLIC_ADDRESSES, ...PUBLIC_IPV6]) {
            expect(isPublicAddress(address), `expected ${address} to be allowed`).toBe(true);
        }
    });
});

describe("HTTP node URL egress policy", () => {
    it("rejects private IP literals and non-http(s) schemes before any lookup", async () => {
        const resolver = vi.fn(async () => PUBLIC_ADDRESSES);

        await expect(assertPublicHttpUrl("http://127.0.0.1/latest", resolver)).rejects.toThrow(/egress/i);
        await expect(assertPublicHttpUrl("http://[::1]/", resolver)).rejects.toThrow(/egress/i);
        await expect(assertPublicHttpUrl("file:///etc/passwd", resolver)).rejects.toThrow(/protocol/i);
        await expect(assertPublicHttpUrl("ftp://example.com/file", resolver)).rejects.toThrow(/protocol/i);
        expect(resolver).not.toHaveBeenCalled();
    });

    it("rejects hostnames that resolve to private or metadata addresses", async () => {
        await expect(
            assertPublicHttpUrl("http://metadata.google.internal/latest", async () => ["169.254.169.254"]),
        ).rejects.toThrow(/egress/i);
        await expect(
            assertPublicHttpUrl("http://internal.example.com", async () => ["93.184.216.34", "10.0.0.5"]),
        ).rejects.toThrow(/egress/i);
        await expect(assertPublicHttpUrl("http://empty.example.com", async () => [])).rejects.toThrow(/resolve/i);
    });

    it("allows a public hostname that resolves only to public addresses", async () => {
        const parsed = await assertPublicHttpUrl(
            "https://api.example.com/v1/resource",
            async () => ["93.184.216.34"],
        );

        expect(parsed.hostname).toBe("api.example.com");
        expect(parsed.protocol).toBe("https:");
    });

    it("returns only validated public addresses for connect-time pinning", async () => {
        const addresses = ["93.184.216.34", "2606:4700:4700::1111"];
        const target = await resolvePublicHttpTarget(
            "https://api.example.com/v1/resource",
            async () => addresses,
        );

        expect(target.url.hostname).toBe("api.example.com");
        expect(target.addresses).toEqual(addresses);
        for (const address of target.addresses) {
            expect(isPublicAddress(address)).toBe(true);
        }
    });

    it("pins an IP-literal target to the validated literal", async () => {
        const target = await resolvePublicHttpTarget("https://8.8.8.8/resource", async () => []);

        expect(target.url.hostname).toBe("8.8.8.8");
        expect(target.addresses).toEqual(["8.8.8.8"]);
        expect(isPublicAddress(target.addresses[0]!)).toBe(true);
    });
});

describe("HTTP node connect-time pinning", () => {
    it("returns pinned addresses for both lookup callback shapes and ignores the requested hostname", () => {
        const lookup = createPinnedLookup(["93.184.216.34", "2606:4700:4700::1111"]);
        const allCallback = vi.fn();
        const singleCallback = vi.fn();

        lookup("decoy.example.com", { all: true }, allCallback);
        lookup("decoy.example.com", { all: false }, singleCallback);

        expect(allCallback).toHaveBeenCalledWith(null, [
            { address: "93.184.216.34", family: 4 },
            { address: "2606:4700:4700::1111", family: 6 },
        ]);
        expect(singleCallback).toHaveBeenCalledWith(null, "93.184.216.34", 4);
    });

    it("creates real per-hop undici dispatchers", () => {
        const first = createPinnedDispatcher(["93.184.216.34"]);
        const second = createPinnedDispatcher(["93.184.216.34"]);

        expect(first).toBeInstanceOf(Agent);
        expect(second).toBeInstanceOf(Agent);
        expect(first).not.toBe(second);
    });
});

describe("HTTP node executor egress enforcement", () => {
    const fetchMock = undiciMock.fetch;

    beforeEach(() => {
        vi.clearAllMocks();
        dnsMock.addresses = ["93.184.216.34"];
        dnsMock.lookup.mockImplementation(async () =>
            dnsMock.addresses.map((address) => ({ address })),
        );
        fetchMock.mockReset();
    });

    function config(url: string) {
        return { nodeType: "Network.Http", config: { url, method: "GET", headers: {}, body: {} } } as any;
    }

    function requestConfig(url: string, method: string, body: unknown) {
        return { nodeType: "Network.Http", config: { url, method, headers: {}, body } } as any;
    }

    function redirectResponse(status: number, location: string) {
        return {
            ok: false,
            status,
            statusText: "Redirect",
            headers: { get: () => location },
            body: { cancel: vi.fn(async () => {}) },
            json: async () => ({}),
        };
    }

    function successResponse() {
        return {
            ok: true,
            status: 200,
            statusText: "OK",
            headers: { get: () => null },
            json: async () => ({ ok: true }),
        };
    }

    it("does not issue a request to a loopback target", async () => {
        await expect(httpNodeExecutor(config("http://127.0.0.1/"))).rejects.toThrow(/egress/i);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("does not issue a request to a non-http scheme", async () => {
        await expect(httpNodeExecutor(config("file:///etc/passwd"))).rejects.toThrow(/protocol/i);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("issues a request to a public host and preserves the executor output", async () => {
        fetchMock.mockResolvedValue({
            ok: true,
            status: 200,
            statusText: "OK",
            headers: { get: () => null },
            json: async () => ({ answer: 42 }),
        });

        const output = await httpNodeExecutor(config("https://api.example.com/resource"));

        expect(dnsMock.lookup).toHaveBeenCalled();
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(output).toEqual({ success: true, output: { answer: 42 } });
    });

    it("re-validates redirect targets and blocks redirects to the metadata service", async () => {
        fetchMock.mockResolvedValueOnce({
            ok: false,
            status: 302,
            statusText: "Found",
            headers: { get: () => "http://169.254.169.254/latest/meta-data" },
            json: async () => ({}),
        });

        await expect(httpNodeExecutor(config("https://api.example.com/resource"))).rejects.toThrow(/egress/i);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it.each([301, 302, 303, 307, 308])(
        "applies standard method and body semantics on a %i redirect",
        async (status) => {
            fetchMock
                .mockResolvedValueOnce(redirectResponse(status, "https://redirect-target.example.com/next"))
                .mockResolvedValueOnce(successResponse());

            const body = { order: 7 };

            await httpNodeExecutor(requestConfig("https://initial.example.com/resource", "POST", body));

            expect(fetchMock).toHaveBeenCalledTimes(2);
            const firstCall = fetchMock.mock.calls[0]!;
            const secondCall = fetchMock.mock.calls[1]!;
            expect(String(firstCall[0])).toBe("https://initial.example.com/resource");
            expect(firstCall[1].method).toBe("POST");
            expect(firstCall[1].body).toEqual(body);
            expect(String(secondCall[0])).toBe("https://redirect-target.example.com/next");
            expect(dnsMock.lookup).toHaveBeenCalledWith("redirect-target.example.com", {
                all: true,
                verbatim: true,
            });

            if (status === 307 || status === 308) {
                expect(secondCall[1].method).toBe("POST");
                expect(secondCall[1].body).toEqual(body);
            } else {
                expect(secondCall[1].method).toBe("GET");
                expect(secondCall[1].body).toBeUndefined();
            }
        },
    );

    it("keeps HEAD on a 303 redirect and drops the body", async () => {
        fetchMock
            .mockResolvedValueOnce(redirectResponse(303, "https://redirect-target.example.com/head"))
            .mockResolvedValueOnce(successResponse());

        await httpNodeExecutor(requestConfig("https://initial.example.com/resource", "HEAD", { stale: true }));

        expect(fetchMock).toHaveBeenCalledTimes(2);
        const secondCall = fetchMock.mock.calls[1]!;
        expect(secondCall[1].method).toBe("HEAD");
        expect(secondCall[1].body).toBeUndefined();
        expect(dnsMock.lookup).toHaveBeenCalledWith("redirect-target.example.com", expect.anything());
    });

    it("keeps the original hostname and releases the pinned dispatcher after the response body", async () => {
        fetchMock.mockResolvedValueOnce(successResponse());

        const output = await httpNodeExecutor(config("https://api.example.com/resource"));

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const call = fetchMock.mock.calls[0]!;
        expect(call[0]).toBeInstanceOf(URL);
        expect((call[0] as URL).hostname).toBe("api.example.com");
        const dispatcher = call[1].dispatcher;
        expect(dispatcher).toBeInstanceOf(Agent);
        expect(dispatcher.destroyed).toBe(true);
        expect(output).toEqual({ success: true, output: { ok: true } });
    });

    it("pins, cancels and destroys a separate dispatcher for every validated redirect hop", async () => {
        const redirect = redirectResponse(302, "https://redirect-target.example.com/next");
        fetchMock.mockResolvedValueOnce(redirect).mockResolvedValueOnce(successResponse());

        await httpNodeExecutor(config("https://initial.example.com/resource"));

        expect(fetchMock).toHaveBeenCalledTimes(2);
        const firstCall = fetchMock.mock.calls[0]!;
        const secondCall = fetchMock.mock.calls[1]!;
        expect((firstCall[0] as URL).hostname).toBe("initial.example.com");
        expect((secondCall[0] as URL).hostname).toBe("redirect-target.example.com");
        expect(redirect.body.cancel).toHaveBeenCalledTimes(1);
        expect(firstCall[1].dispatcher).toBeInstanceOf(Agent);
        expect(secondCall[1].dispatcher).toBeInstanceOf(Agent);
        expect(firstCall[1].dispatcher).not.toBe(secondCall[1].dispatcher);
        expect(firstCall[1].dispatcher.destroyed).toBe(true);
        expect(secondCall[1].dispatcher.destroyed).toBe(true);
    });

    it("destroys the pinned dispatcher when the request rejects", async () => {
        fetchMock.mockRejectedValueOnce(new Error("network down"));

        await expect(httpNodeExecutor(config("https://api.example.com/resource"))).rejects.toThrow("network down");

        const dispatcher = fetchMock.mock.calls[0]![1].dispatcher;
        expect(dispatcher).toBeInstanceOf(Agent);
        expect(dispatcher.destroyed).toBe(true);
    });
});
