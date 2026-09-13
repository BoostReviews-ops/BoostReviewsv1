import { NextResponse } from "next/server";
import { adminClient, currentUser, supabaseConfigured, userClient } from "@/lib/db/server";
import { markPublished, saveReply, tokenStore } from "@/lib/db/repo";
import { GoogleBusinessProvider, getGoogleOAuthConfig } from "@/lib/providers/google";

/**
 * POST /api/reviews/:id/reply  { text, status: "draft" | "approved", aiAssisted }
 * Saves the reply. When status is "approved" and Google is connected, publishes it
 * to Google Business Profile. Nothing is ever published without an explicit approve.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!supabaseConfigured()) return NextResponse.json({ mode: "demo" });
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const body = (await req.json()) as { text: string; status: "draft" | "approved"; aiAssisted?: boolean };
  if (!body.text?.trim()) return NextResponse.json({ error: "text required" }, { status: 400 });

  const sb = await userClient();
  const responseId = await saveReply(sb, id, body.text.trim(), body.status, !!body.aiAssisted, user.id);

  let published = false;
  if (body.status === "approved" && getGoogleOAuthConfig()) {
    const { data: review } = await sb.from("reviews").select("external_id, location_id, locations(business_id)").eq("id", id).single();
    const locJoin = review?.locations as unknown as { business_id: string } | { business_id: string }[] | null;
    const businessId = Array.isArray(locJoin) ? locJoin[0]?.business_id : locJoin?.business_id;
    if (review && businessId) {
      try {
        const admin = adminClient();
        const provider = new GoogleBusinessProvider(getGoogleOAuthConfig()!, tokenStore(admin));
        await provider.publishReply(businessId, review.external_id, body.text.trim());
        await markPublished(admin, responseId);
        published = true;
      } catch (e) {
        return NextResponse.json({ ok: true, responseId, published: false, warning: `Saved but not published to Google: ${(e as Error).message}` });
      }
    }
  }
  return NextResponse.json({ ok: true, responseId, published });
}
