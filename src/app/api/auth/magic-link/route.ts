import { NextResponse } from "next/server";

/**
 * POST /api/auth/magic-link — send a Supabase magic-link email.
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (server only).
 * In demo mode it acknowledges without sending anything.
 */
export async function POST(req: Request) {
  const { email } = (await req.json().catch(() => ({}))) as { email?: string };
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ ok: true, mode: "demo" });

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${origin}/app` } });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, mode: "live" });
}
