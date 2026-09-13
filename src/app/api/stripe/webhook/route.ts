import { NextResponse } from "next/server";
import Stripe from "stripe";
import { adminClient, supabaseConfigured } from "@/lib/db/server";

/**
 * POST /api/stripe/webhook — Stripe event receiver.
 * Register in Stripe:  https://<app-domain>/api/stripe/webhook
 * Requires STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET.
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

  const planFromPrice = (priceId: string | undefined) => {
    if (!priceId) return null;
    if (priceId === process.env.STRIPE_PRICE_STARTER) return "starter";
    if (priceId === process.env.STRIPE_PRICE_GROWTH) return "growth";
    if (priceId === process.env.STRIPE_PRICE_PREMIUM) return "premium";
    return null;
  };

  if (supabaseConfigured()) {
    const sb = adminClient();
    const upsert = async (sub: Stripe.Subscription, orgId?: string | null) => {
      const item = sub.items.data[0];
      const plan = planFromPrice(item?.price.id) ?? "growth";
      const pm = typeof sub.default_payment_method === "object" && sub.default_payment_method?.card ? sub.default_payment_method.card : null;
      const row = {
        org_id: orgId ?? sub.metadata?.org_id ?? null,
        stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
        stripe_subscription_id: sub.id,
        plan,
        status: sub.status,
        current_period_end: item?.current_period_end ? new Date(item.current_period_end * 1000).toISOString() : null,
        payment_method_brand: pm?.brand ?? null,
        payment_method_last4: pm?.last4 ?? null,
        updated_at: new Date().toISOString(),
      };
      if (!row.org_id) return; // metadata.org_id is set by /api/stripe/checkout
      await sb.from("subscriptions").upsert(row, { onConflict: "stripe_subscription_id" });
    };
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object;
        if (typeof s.subscription === "string") {
          const sub = await stripe.subscriptions.retrieve(s.subscription, { expand: ["default_payment_method"] });
          await upsert(sub, s.metadata?.org_id ?? s.client_reference_id);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await upsert(event.data.object);
        break;
      default:
        break;
    }
  }
  return NextResponse.json({ received: true, type: event.type });
}
