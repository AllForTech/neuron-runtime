

export function getSupabaseEnvironmentVariables() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabasePublishableKey =
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

    if (
        supabaseUrl === null ||
        supabaseUrl === undefined ||
        supabasePublishableKey === null ||
        supabasePublishableKey === undefined ||
        supabaseAnonKey === null ||
        supabaseAnonKey === undefined
    ) {
        throw new Error(`Missing environment variable.`);
    } else {
        return {
            supabaseUrl,
            supabaseAnonKey,
            supabasePublishableKey,
        };
    }
}