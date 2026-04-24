import { createClient } from '@supabase/supabase-js';
import {getSupabaseEnvironmentVariables} from "../utils/index.js";

const { supabaseUrl, supabaseAnonKey } = getSupabaseEnvironmentVariables();


export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});