import { cookies } from 'next/headers';
import { createSupabaseServerClient as createServerClient } from "@neuron/auth";

export async function createSupabaseServerClient() {
  return createServerClient(cookies);
}
