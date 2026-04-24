export * from "./supabase/client.js";
export * from "./supabase/server.js";
export * from "./supabase/apiClient.js";
export type { Session, User } from "@supabase/supabase-js";
export { createServerClient } from '@supabase/ssr';
export { getSupabaseEnvironmentVariables } from "./utils/index.js";