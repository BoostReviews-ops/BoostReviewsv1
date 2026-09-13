import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Auth gate for /app.
 *  - Demo mode (no Supabase configured, or the br_demo cookie set by /demo): always allowed.
 *  - Live mode: requires a Supabase session; otherwise redirect to /login.
 * Also refreshes the Supabase session cookie on every request.
 */
export async function proxy(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const res = NextResponse.next({ request: req });
  if (!url || !key) return res; // demo-only deployment

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list) => list.forEach(({ name, value, options }) => res.cookies.set(name, value, options)),
    },
  });
  const { data } = await supabase.auth.getUser();
  const isApp = req.nextUrl.pathname.startsWith("/app");
  const demo = req.cookies.get("br_demo")?.value === "1";
  if (isApp && !data.user && !demo) {
    const login = req.nextUrl.clone();
    login.pathname = "/login";
    login.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  return res;
}

export const config = { matcher: ["/app/:path*", "/login", "/onboarding"] };
