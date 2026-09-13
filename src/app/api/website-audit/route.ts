import { NextResponse } from "next/server";

/**
 * POST /api/website-audit — create a website-services lead.
 * Demo: acknowledged (the browser store keeps the record).
 * Production: insert into website_leads and notify via email/Slack.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { contactName?: string; email?: string; websiteUrl?: string } | null;
  if (!body?.email || !body.contactName) return NextResponse.json({ error: "contactName and email are required" }, { status: 400 });
  // TODO(production): supabase.from("website_leads").insert(...)
  return NextResponse.json({ ok: true, id: `lead_${Date.now()}`, mode: "demo" });
}
