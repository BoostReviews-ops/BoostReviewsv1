import { NextResponse } from "next/server";

/**
 * POST /api/nfc/tap — record a tap event (production).
 * Body: { slug, source: "nfc" | "qr" | "link", userAgent? }
 * Demo mode records taps client-side; this endpoint acknowledges and no-ops
 * until the database is connected.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { slug?: string; source?: string };
  if (!body.slug) return NextResponse.json({ error: "slug required" }, { status: 400 });
  // TODO(production): insert into tap_events (card_id via review_cards.slug).
  return NextResponse.json({ ok: true, mode: process.env.BUSINESS_DATA_PROVIDER === "google" ? "live" : "demo" });
}
