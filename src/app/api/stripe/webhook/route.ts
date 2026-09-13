import { NextResponse } from "next/server";
import Stripe from "stripe";

/**
 * POST /api/stripe/webhook — Stripe event receiver.
 * Webhook URL to register in Stripe:  https://<app-domain>/api/stripe/webhook
 * Requires STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET. Until they are set the
 * endpoint acknowledges nothing and returns 503 so misconfiguration is obvious.
 *
 * Events handled in production (persist to `subscriptions` table):
 *   checkout.session.completed, customer.subscription.created/updated/deleted,
 *   invoice.paid, invoice.payment_failed
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const whsec = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !whsec) return NextResponse.json({ error: "Stripe is not configured (STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET)." }, { status: 503 });

  const stripe = new Stripe(secret);
  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig ?? "", whsec);
  } catch (e) {
    return NextResponse.json({ error: `Invalid signature: ${(e as Error).message}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "invoice.paid":
    case "invoice.payment_failed":
      // TODO(production): upsert into `subscriptions` keyed by stripe_customer_id.
      break;
    default:
      break;
  }
  return NextResponse.json({ received: true, type: event.type });
}
