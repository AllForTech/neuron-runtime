import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseEnvironmentVariables } from "../utils";

const { supabaseUrl, supabaseAnonKey } = getSupabaseEnvironmentVariables();

export const createClient = () =>
    createBrowserClient(supabaseUrl, supabaseAnonKey);
