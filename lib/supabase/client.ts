import { createBrowserClient } from "@supabase/ssr";
import { requireSupabaseEnv } from "@/lib/supabase/env";

/**
 * Browser Supabase client for Client Components.
 * Use this for auth in the browser and Realtime channels.
 * createBrowserClient is a singleton; calling this many times is cheap.
 */
export function createClient() {
  const { url, anonKey } = requireSupabaseEnv();
  return createBrowserClient(url, anonKey);
}
