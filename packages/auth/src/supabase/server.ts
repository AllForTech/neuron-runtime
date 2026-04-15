import { createServerClient } from '@supabase/ssr';
import {getSupabaseEnvironmentVariables} from "../utils";

export async function createSupabaseServerClient(cookies: any) {
    const cookieStore = await cookies();

    const { supabaseUrl, supabaseAnonKey } = getSupabaseEnvironmentVariables();

    return createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                } catch {

                }
            },
        },
    });
}
