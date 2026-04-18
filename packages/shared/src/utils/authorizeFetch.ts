export async function authorizedFetch<T>(
    url: string,
    options: RequestInit = {},
    token: string | null | undefined
): Promise<T> {
    if (!token) {
        throw new Error('Authentication token is missing or expired');
    }

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
            Authorization: `Bearer ${token}`,
        },
    });

    // 1. Parse the JSON once
    const data = await response.json().catch(() => null);

    if (!response.ok) {
        // 2. If it's a 500, log it to the console so you can see it on Zorin OS
        console.error(`[API Error] ${response.status} ${url}:`, data);

        throw new Error(
            data?.message ||
            data?.error ||
            `Request failed with status ${response.status}`
        );
    }

    // 3. Return the already-parsed data
    return data as T;
}