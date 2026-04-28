export function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function runWithTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs?: number
): Promise<T> {
    if (!timeoutMs) return fn();

    return Promise.race([
        fn(),
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error("Execution timeout")), timeoutMs)
        )
    ]);
}