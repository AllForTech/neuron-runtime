interface TaskOptions {
    retry?: number;
    timeout?: number;
    customErrorMessage?: string;
}

/**
 * A sleek, type-safe wrapper for async operations.
 * Returns [data, error, loading] for clean array destructuring.
 */
export async function safeTask<T>(
    task: () => Promise<T>,
    options: TaskOptions = {}
): Promise<[T | null, Error | null, boolean]> {
    const { retry = 0, timeout, customErrorMessage } = options;

    let attempts = 0;

    const execute = async (): Promise<[T | null, Error | null, boolean]> => {
        try {
            // Handle Timeout logic
            const promise = timeout
                ? Promise.race([
                    task(),
                    new Promise<never>((_, reject) =>
                        setTimeout(() => reject(new Error("Operation timed out")), timeout)
                    )
                ])
                : task();

            const data = await promise;
            return [data, null, false];

        } catch (err) {
            if (attempts < retry) {
                attempts++;
                return execute();
            }

            const finalError = err instanceof Error ? err : new Error(String(err));

            if (customErrorMessage) {
                finalError.message = customErrorMessage;
            }

            return [null, finalError, false];
        }
    };

    return execute();
}