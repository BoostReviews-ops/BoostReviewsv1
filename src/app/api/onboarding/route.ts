import { NextResponse } from "next/server";
import { currentUser, supabaseConfigured, userClient } from "@/lib/db/server";
import { createBusiness } from "@/lib/db/repo";

/** POST /api/onboarding — creates org, business, location and review card for the signed-in user. */
export async function POST(req: Request) {
  if (!supabaseConfigured()) return NextResponse.json({ mode: "demo" });
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const b = (await req.json()) as { businessName?: string; phone?: string; website?: string; address?: string; city?: string; destinationUrl?: string };
  if (!b.businessName?.trim()) return NextResponse.json({ error: "businessName required" }, { status: 400 });
  const sb = await userClient();
  await sb.from("profiles").upsert({ id: user.id, email: user.email, full_name: (user.user_metadata as { full_name?: string })?.full_name ?? null });
  const created = await createBusiness(sb, user.id, { ...b, businessName: b.businessName.trim() });
  return NextResponse.json({ ok: true, ...created });
}
