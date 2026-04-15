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
            ...options?.headers,
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        // Attempt to get a specific error message from the API body
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Request failed with status ${response.status}`);
    }

    return response.json();
}