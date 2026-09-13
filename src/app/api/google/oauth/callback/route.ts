import { NextResponse } from "next/server";
import { getGoogleOAuthConfig } from "@/lib/providers/google";
import { adminClient, currentUser, supabaseConfigured, userClient } from "@/lib/db/server";
import { primaryLocationForUser, saveGoogleConnection } from "@/lib/db/repo";

/**
 * GET /api/google/oauth/callback — exchange the code, store tokens server-side,
 * discover the user's Business Profile location and save its resource name.
 * Tokens never reach the browser.
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
  const tokens = (await tokenRes.json()) as { access_token: string; refresh_token?: string; expires_in: number; id_token?: string };

  if (!supabaseConfigured()) return NextResponse.redirect(`${url.origin}/app/settings?google=no-database`);
  const user = await currentUser();
  if (!user) return NextResponse.redirect(`${url.origin}/login?next=/app/settings`);
  const ctx = await primaryLocationForUser(await userClient(), user.id);
  if (!ctx) return NextResponse.redirect(`${url.origin}/onboarding?google=connect-after-setup`);

  const admin = adminClient();
  const email = tokens.id_token ? (JSON.parse(Buffer.from(tokens.id_token.split(".")[1], "base64").toString()) as { email?: string }).email ?? null : null;
  await saveGoogleConnection(admin, ctx.business.id, tokens, email);

  // Discover the first account + location so the sync job knows what to pull.
  try {
    const h = { Authorization: `Bearer ${tokens.access_token}` };
    const acc = (await (await fetch("https://mybusinessaccountmanagement.googleapis.com/v1/accounts", { headers: h })).json()) as { accounts?: { name: string }[] };
    const accountName = acc.accounts?.[0]?.name;
    if (accountName) {
      const locs = (await (await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name,title,metadata`, { headers: h })).json()) as { locations?: { name: string; title: string; metadata?: { placeId?: string } }[] };
      const first = locs.locations?.[0];
      if (first) {
        await admin.from("locations").update({ google_location_resource: `${accountName}/${first.name}`, google_place_id: first.metadata?.placeId ?? null }).eq("id", ctx.location.id);
      }
    }
  } catch {
    /* location can be selected later from Settings */
  }
  const res = NextResponse.redirect(`${url.origin}/app/settings?google=connected`);
  res.cookies.set("g_oauth_state", "", { maxAge: 0, path: "/" });
  return res;
}
