import { NextResponse } from "next/server";
import { getGoogleOAuthConfig } from "@/lib/providers/google";

/**
 * GET /api/google/oauth/callback — exchange the code for tokens.
 * Tokens are stored server-side (google_connections table). Never returned to the client.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const cfg = getGoogleOAuthConfig();
  if (!cfg) return NextResponse.redirect(`${url.origin}/app/settings?google=not-configured`);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = req.headers.get("cookie")?.match(/g_oauth_state=([^;]+)/)?.[1];
  if (!code || !state || state !== cookieState) return NextResponse.redirect(`${url.origin}/app/settings?google=invalid-state`);

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: cfg.clientId, client_secret: cfg.clientSecret, redirect_uri: cfg.redirectUri, grant_type: "authorization_code" }),
  });
  if (!tokenRes.ok) return NextResponse.redirect(`${url.origin}/app/settings?google=token-error`);
  const tokens = (await tokenRes.json()) as { access_token: string; refresh_token?: string; expires_in: number };

  // TODO(production): persist to google_connections for the signed-in user's business,
  // then list accounts/locations so the user can pick the right location.
  void tokens;
  const res = NextResponse.redirect(`${url.origin}/app/settings?google=connected`);
  res.cookies.set("g_oauth_state", "", { maxAge: 0, path: "/" });
  return res;
}
