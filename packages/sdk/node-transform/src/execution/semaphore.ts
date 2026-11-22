/**
 * FIFO gate that caps how many permit holders may run at once.
 *
 * Used by the transform executor to bound simultaneous isolate creation.
 * A released permit is handed directly to the longest-waiting caller, so the
 * active count never exceeds the configured maximum.
 */
export class Semaphore {
    private active = 0;
    private readonly waiters: Array<() => void> = [];

    constructor(private readonly maxConcurrency: number) {
        if (!Number.isInteger(maxConcurrency) || maxConcurrency < 1) {
            throw new RangeError("maxConcurrency must be a positive integer");
        }
    }

    get activeCount(): number {
        return this.active;
    }

    get queuedCount(): number {
        return this.waiters.length;
    }

    acquire(): Promise<void> {
        if (this.active < this.maxConcurrency) {
            this.active += 1;
            return Promise.resolve();
        }
        return new Promise<void>((resolve) => {
            this.waiters.push(resolve);
        });
    }

    release(): void {
        const next = this.waiters.shift();
        if (next) {
            // Transfer the permit; the active count stays at the cap.
            next();
            return;
        }
        if (this.active === 0) {
            throw new Error("Semaphore released without an outstanding acquire");
        }
        this.active -= 1;
    }
}
