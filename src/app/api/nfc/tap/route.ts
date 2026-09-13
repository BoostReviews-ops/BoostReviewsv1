import { NextResponse } from "next/server";
import { adminClient, supabaseConfigured } from "@/lib/db/server";
import { recordTap, resolveCardBySlug } from "@/lib/db/repo";

/** POST /api/nfc/tap { slug, source } — records a tap (live mode). Demo mode acknowledges only. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { slug?: string; source?: "nfc" | "qr" | "link" };
  if (!body.slug) return NextResponse.json({ error: "slug required" }, { status: 400 });
  if (!supabaseConfigured()) return NextResponse.json({ ok: true, mode: "demo" });
  const sb = adminClient();
  const card = await resolveCardBySlug(sb, body.slug);
  if (!card) return NextResponse.json({ error: "unknown card" }, { status: 404 });
  await recordTap(sb, card.id, body.source ?? "link", req.headers.get("user-agent"));
  return NextResponse.json({ ok: true, mode: "live" });
}
