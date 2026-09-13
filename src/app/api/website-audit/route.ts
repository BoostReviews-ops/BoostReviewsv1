import { NextResponse } from "next/server";
import { adminClient, supabaseConfigured } from "@/lib/db/server";
import { insertWebsiteLead } from "@/lib/db/repo";

/** POST /api/website-audit — creates a website-services lead (stored when the database is configured). */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { contactName?: string; email?: string; phone?: string; websiteUrl?: string; notes?: string; businessId?: string } | null;
  if (!body?.email || !body.contactName) return NextResponse.json({ error: "contactName and email are required" }, { status: 400 });
  if (!supabaseConfigured()) return NextResponse.json({ ok: true, id: `lead_${Date.now()}`, mode: "demo" });
  const id = await insertWebsiteLead(adminClient(), {
    business_id: body.businessId && /^[0-9a-f-]{36}$/.test(body.businessId) ? body.businessId : null,
    contact_name: body.contactName, email: body.email, phone: body.phone, website_url: body.websiteUrl, notes: body.notes,
  });
  return NextResponse.json({ ok: true, id, mode: "live" });
}
