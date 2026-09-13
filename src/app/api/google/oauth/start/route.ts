import { NextResponse } from "next/server";
import { buildGoogleAuthUrl, getGoogleOAuthConfig } from "@/lib/providers/google";

/**
 * GET /api/google/oauth/start — begin Google Business Profile authorization.
 * Redirect URI to register in Google Cloud: https://<app-domain>/api/google/oauth/callback
 */
export async function GET(req: Request) {
  const cfg = getGoogleOAuthConfig();
  const origin = new URL(req.url).origin;
  if (!cfg) {
    return NextResponse.redirect(`${origin}/app/settings?google=not-configured`);
  }
  const state = crypto.randomUUID();
  const res = NextResponse.redirect(buildGoogleAuthUrl(cfg, state));
  res.cookies.set("g_oauth_state", state, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600, path: "/" });
  return res;
}
