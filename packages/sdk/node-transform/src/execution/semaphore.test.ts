import { describe, expect, it } from "vitest";
import { Semaphore } from "./semaphore.js";

function flushMicrotasks(): Promise<void> {
    return new Promise<void>((resolve) => setImmediate(resolve));
}

describe("Semaphore", () => {
    it("caps active holders and queues excess callers in FIFO order", async () => {
        const semaphore = new Semaphore(2);
        const order: number[] = [];

        await semaphore.acquire();
        await semaphore.acquire();
        expect(semaphore.activeCount).toBe(2);

        const third = semaphore.acquire().then(() => { order.push(3); });
        const fourth = semaphore.acquire().then(() => { order.push(4); });
        await flushMicrotasks();
        expect(order).toEqual([]);
        expect(semaphore.queuedCount).toBe(2);

        semaphore.release();
        await third;
        expect(semaphore.activeCount).toBe(2);
        expect(order).toEqual([3]);

        semaphore.release();
        await fourth;
        expect(order).toEqual([3, 4]);

        semaphore.release();
        semaphore.release();
        expect(semaphore.activeCount).toBe(0);
        expect(semaphore.queuedCount).toBe(0);
    });

    it("rejects invalid concurrency limits", () => {
        expect(() => new Semaphore(0)).toThrow(RangeError);
        expect(() => new Semaphore(-1)).toThrow(RangeError);
        expect(() => new Semaphore(1.5)).toThrow(RangeError);
    });
});
