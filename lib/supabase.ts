import { createBrowserClient } from "@supabase/ssr";
import { DEV_AUTH_BYPASS } from "@/lib/dev-mode";
import { createDevSupabaseClient } from "@/lib/supabase-dev";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  (DEV_AUTH_BYPASS ? "http://127.0.0.1:54321" : "");
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  (DEV_AUTH_BYPASS ? "local-demo-key" : "");

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

const browserClient = createBrowserClient(
  supabaseUrl,
  supabaseKey
);
const devClient = createDevSupabaseClient() as unknown as typeof browserClient;

export function createClient() {
  return DEV_AUTH_BYPASS ? devClient : browserClient;
}

export const supabase = createClient();
