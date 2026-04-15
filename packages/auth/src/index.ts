export * from "./supabase/client";
export * from "./supabase/server";
export type { User } from "@supabase/supabase-js";
export { createServerClient } from '@supabase/ssr';
export { getSupabaseEnvironmentVariables } from "./utils/index";