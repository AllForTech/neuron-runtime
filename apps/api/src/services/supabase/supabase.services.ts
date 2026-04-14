import {supabase} from "../../middleware/supabaseAuth";

export async function getUserFromRequest(req: any): Promise<any> {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return null;

    try {
        // Wrap the execution in the retry helper
        return await retryWithBackoff(async () => {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);

            try {
                const { data, error } = await supabase.auth.getUser(token);

                if (error) {
                    // Critical: If Supabase says the token is bad, don't retry.
                    // Just throw so we can handle it in the catch block.
                    throw error;
                }
                return data.user;
            } finally {
                clearTimeout(timeout);
            }
        });
    } catch (err: any) {
        if (err.name === 'AbortError') {
            console.error("[Auth] All retry attempts timed out.");
        } else {
            console.error("[Auth] Permanent authentication error:", err.message);
        }
        return null;
    }
}


async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 500 // Start with 500ms
): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (err: any) {
            lastError = err;

            const isNetworkError = err.name === 'AbortError' || err.message?.includes('fetch');
            if (!isNetworkError || attempt === maxRetries - 1) break;

            // Calculate delay: baseDelay * 2^attempt + random jitter
            const delay = (baseDelay * Math.pow(2, attempt)) + (Math.random() * 100);

            console.warn(`[Auth] Retry attempt ${attempt + 1} after ${Math.round(delay)}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw lastError;
}


export const workflowBroadcast = (runId: string) => ({

    dispatch: async (type: string, payload: any) => {
        await supabase.channel(`workflow_${runId}`).send({
            type: 'broadcast',
            event: 'workflow_action',
            payload: { type, ...payload }
        });
    }
});


export const workflowRuntimeBroadcast = (runId: string) => ({

    dispatch: async (type: string, payload: any) => {
        await supabase.channel(`workflow_${runId}`).send({
            type: 'broadcast',
            event: 'workflow_runtime_action',
            payload: { type, ...payload }
        });
    }
});

