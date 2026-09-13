import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DEMO_REVIEW_CARD } from "@/lib/demo/seed";
import { adminClient, supabaseConfigured } from "@/lib/db/server";
import { recordTap, resolveCardBySlug } from "@/lib/db/repo";
import { RedirectClient } from "./RedirectClient";

export const metadata: Metadata = { title: "Leave a review", robots: { index: false } };

/** Static export pre-renders the demo card; the server build resolves any slug. */
export function generateStaticParams() {
  return [{ slug: DEMO_REVIEW_CARD.slug }];
}

/**
 * NFC / QR redirect — the PERMANENT URL programmed onto physical cards:
 *   https://<app-domain>/r/<slug>
 * Live: look the slug up in review_cards, log a tap_event, 302 to the destination.
 * Demo slug (or no database): client interstitial using the browser's demo state.
 */
export default async function RedirectPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ src?: string }> }) {
  const { slug } = await params;
  if (slug !== DEMO_REVIEW_CARD.slug && supabaseConfigured()) {
    // Live path only: dynamic APIs are touched here so the demo slug can still be pre-rendered.
    const { src } = await searchParams;
    const sb = adminClient();
    const card = await resolveCardBySlug(sb, slug);
    if (card && card.status === "active" && card.destination_url) {
      const ua = (await headers()).get("user-agent");
      await recordTap(sb, card.id, src === "qr" ? "qr" : "nfc", ua);
      redirect(card.destination_url);
    }
    return <RedirectClient slug={slug} state={card ? "paused" : "notfound"} />;
  }
  return <RedirectClient slug={slug} />;
}
