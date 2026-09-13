/**
 * Supabase clients (server side).
 *
 *  - adminClient(): service-role client for jobs, webhooks and the NFC redirect.
 *    Never import this from a client component.
 *  - userClient(): cookie-based client that acts as the signed-in user (RLS applies).
 *
 * Everything is env-gated: when NEXT_PUBLIC_SUPABASE_URL is missing the app runs
 * in demo mode and none of this is used.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function supabaseConfigured() {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function adminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase service role is not configured.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function userClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase is not configured.");
  const store = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          /* called from a Server Component — cookies are refreshed by proxy.ts */
        }
      },
    },
  });
}

/** Signed-in user or null. */
export async function currentUser() {
  if (!supabaseConfigured()) return null;
  const sb = await userClient();
  const { data } = await sb.auth.getUser();
  return data.user ?? null;
}
