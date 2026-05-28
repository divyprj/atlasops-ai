// ============================================================
// AtlasOps AI — Supabase Client
// Browser + Server client initialization
// ============================================================

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// --- Browser Client (uses anon key, respects RLS) ---

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowser(): SupabaseClient {
  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return browserClient;
}

// --- Server Client (uses service role key, bypasses RLS) ---

export function getSupabaseServer(): SupabaseClient {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

// --- Connection Check ---

export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

// --- Generic query helper with error handling ---

export async function querySupabase<T>(
  queryFn: (client: SupabaseClient) => Promise<{ data: T | null; error: unknown }>
): Promise<T | null> {
  if (!isSupabaseConfigured()) return null;

  const client = getSupabaseServer();
  const { data, error } = await queryFn(client);

  if (error) {
    console.error("[Supabase Query Error]", error);
    return null;
  }

  return data;
}
