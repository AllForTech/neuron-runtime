import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseEnvironmentVariables } from '@/lib/utils';
import { createServerClient } from '@supabase/ssr'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const { supabaseUrl, supabaseAnonKey, supabasePublishableKey } = getSupabaseEnvironmentVariables();

    const supabase = createServerClient(
        supabaseUrl,
        supabasePublishableKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    // Update request cookies for the current execution context
                    cookiesToSet.forEach(({name, value}) => request.cookies.set(name, value));

                    // Sync with the response we'll eventually return
                    supabaseResponse = NextResponse.next({request});
                    cookiesToSet.forEach(({name, value, options}) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            }
        }
    )

    // // IMPORTANT: Use getUser() to verify the session server-side
    // const { data: { user } } = await supabase.auth.getUser();
    //
    // const url = request.nextUrl.clone();
    //
    // // 1. If not logged in and trying to access protected routes
    // if (!user && (url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/editor'))) {
    //     url.pathname = '/sign-in';
    //     return NextResponse.redirect(url);
    // }
    //
    // // 2. If logged in and trying to access auth pages (Sign-in/Sign-up)
    // if (user && (url.pathname === '/sign-in' || url.pathname === '/sign-up' || url.pathname === '/')) {
    //     url.pathname = '/dashboard';
    //     // We must pass the existing supabaseResponse's cookies to the new redirect
    //     const redirectResponse = NextResponse.redirect(url);
    //
    //     // Manual cookie sync to ensure the session follows the redirect
    //     supabaseResponse.cookies.getAll().forEach((cookie) => {
    //         redirectResponse.cookies.set(cookie.name, cookie.value);
    //     });
    //
    //     return redirectResponse;
    // }

    await supabase.auth.getClaims()
    return supabaseResponse
}