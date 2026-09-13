import { NextResponse } from "next/server";
import { adminClient, supabaseConfigured } from "@/lib/db/server";
import { tokenStore, upsertReviews } from "@/lib/db/repo";
import { GoogleBusinessProvider, getGoogleOAuthConfig } from "@/lib/providers/google";
import { getAIService } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * GET /api/cron/sync-reviews  (Vercel Cron; see vercel.json)
 * For every connected business: pull reviews from Google, tag new ones with
 * sentiment + themes via the AI service, upsert into the database.
 * Protected by CRON_SECRET (Vercel sends it as a Bearer token).
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!supabaseConfigured()) return NextResponse.json({ mode: "demo", synced: 0 });
  const cfg = getGoogleOAuthConfig();
  if (!cfg) return NextResponse.json({ error: "Google not configured" }, { status: 503 });

  const sb = adminClient();
  const provider = new GoogleBusinessProvider(cfg, tokenStore(sb));
  const ai = getAIService();
  const { data: conns } = await sb.from("google_connections").select("business_id").eq("status", "active");
  const results: Record<string, unknown>[] = [];

  for (const c of conns ?? []) {
    try {
      const { data: loc } = await sb.from("locations").select("id, google_location_resource").eq("business_id", c.business_id).order("is_primary", { ascending: false }).limit(1).maybeSingle();
      if (!loc?.google_location_resource) { results.push({ business: c.business_id, skipped: "no location resource" }); continue; }
      const reviews = await provider.listReviews(c.business_id);
      // Only analyze reviews we haven't stored yet
      const { data: known } = await sb.from("reviews").select("external_id").eq("location_id", loc.id);
      const knownIds = new Set((known ?? []).map((k) => k.external_id));
      const fresh = reviews.filter((r) => !knownIds.has(r.id));
      for (const r of fresh) {
        if (r.text) {
          const a = await ai.analyzeSentiment(r.text, r.rating);
          r.sentiment = a.sentiment;
          r.themes = a.themes;
        }
      }
      const n = await upsertReviews(sb, loc.id, reviews.map((r) => ({ ...r, locationId: loc.id })));
      const summary = await provider.getProfileSummary(c.business_id);
      await sb.from("locations").update({ google_rating: summary.rating, google_review_count: summary.totalReviews }).eq("id", loc.id);
      await sb.from("google_connections").update({ last_synced_at: new Date().toISOString() }).eq("business_id", c.business_id);
      results.push({ business: c.business_id, upserted: n, analyzed: fresh.length });
    } catch (e) {
      await sb.from("google_connections").update({ status: "error" }).eq("business_id", c.business_id);
      results.push({ business: c.business_id, error: (e as Error).message });
    }
  }
  return NextResponse.json({ ok: true, results });
}
