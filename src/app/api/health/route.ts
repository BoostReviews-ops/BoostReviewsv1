import { NextResponse } from "next/server";
import { activeProviderKind } from "@/lib/providers";

export const dynamic = "force-dynamic";

/** GET /api/health — deployment sanity check. Never exposes secret values. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    provider: activeProviderKind(),
    ai: process.env.AI_PROVIDER === "anthropic" && !!process.env.ANTHROPIC_API_KEY ? "anthropic" : "demo",
    stripe: !!process.env.STRIPE_SECRET_KEY ? "configured" : "demo",
    supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL ? "configured" : "not-configured",
    time: new Date().toISOString(),
  });
}
