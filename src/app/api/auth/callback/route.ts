import { NextResponse } from "next/server";
import { userClient, supabaseConfigured } from "@/lib/db/server";

/** Supabase magic-link / OAuth return: exchanges the code for a session cookie. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/app";
  if (!supabaseConfigured() || !code) return NextResponse.redirect(`${url.origin}/login?error=auth`);
  const sb = await userClient();
  const { error } = await sb.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(`${url.origin}/login?error=${encodeURIComponent(error.message)}`);
  const res = NextResponse.redirect(`${url.origin}${next}`);
  res.cookies.set("br_demo", "", { maxAge: 0, path: "/" }); // a real login leaves demo mode
  return res;
}
