import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DEMO_REVIEW_CARD } from "@/lib/demo/seed";
import { activeProviderKind } from "@/lib/providers";
import { RedirectClient } from "./RedirectClient";

export const metadata: Metadata = { title: "Leave a review", robots: { index: false } };

/** Static export pre-renders the demo card; the server build resolves any slug. */
export function generateStaticParams() {
  return [{ slug: DEMO_REVIEW_CARD.slug }];
}

/**
 * NFC / QR redirect endpoint — the URL programmed onto physical cards.
 *
 *   https://<app-domain>/r/<slug>
 *
 * This path is PERMANENT once cards are distributed. The destination behind it
 * is editable at any time from the dashboard.
 *
 * Production: the slug is looked up in `review_cards`, a tap_event is written,
 * and the request is 302-redirected server-side (no interstitial).
 * Demo: the destination lives in the visitor's browser store, so a tiny client
 * interstitial resolves it, records the tap, and redirects.
 */
export default async function RedirectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (activeProviderKind() === "google") {
    // Production path (wired to Supabase in GOING_LIVE): resolve + log + redirect.
    // const card = await db.reviewCards.findBySlug(slug); await db.tapEvents.insert(...)
    // redirect(card.destinationUrl)
    redirect("/");
  }

  return <RedirectClient slug={slug} />;
}
