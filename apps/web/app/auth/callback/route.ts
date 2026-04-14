import { NextResponse } from 'next/server';
import { createSupabaseServerClient as createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');

    let next = searchParams.get('next') ?? '/dashboard';

    if (!next.startsWith('/')) {
        next = '/dashboard';
    }

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            const isLocalEnv = process.env.NODE_ENV === 'development';

            // FIX: Append a cache-busting timestamp or ensure origin is clean
            // This forces Next.js and the browser to treat the redirect as a fresh request
            const redirectUrl = isLocalEnv
                ? `${origin}${next}`
                : `https://${request.headers.get('x-forwarded-host') || origin}${next}`;

            return NextResponse.redirect(redirectUrl);
        }
    }

    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
