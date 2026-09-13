import { NextResponse } from "next/server";
import { currentUser, supabaseConfigured, userClient } from "@/lib/db/server";
import { loadDataset, primaryLocationForUser } from "@/lib/db/repo";

export const dynamic = "force-dynamic";

/** GET /api/me/dataset — the signed-in user's live dataset (same shape as the demo). */
export async function GET() {
  if (!supabaseConfigured()) return NextResponse.json({ mode: "demo" }, { status: 200 });
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const sb = await userClient();
  const ctx = await primaryLocationForUser(sb, user.id);
  if (!ctx) return NextResponse.json({ mode: "onboarding" }, { status: 200 });
  const dataset = await loadDataset(sb, ctx.location.id);
  return NextResponse.json({ mode: "live", dataset, locationId: ctx.location.id, businessId: ctx.business.id });
}
