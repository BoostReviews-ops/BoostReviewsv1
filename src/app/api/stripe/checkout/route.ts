import { NextResponse } from "next/server";
import Stripe from "stripe";
import { PLANS } from "@/lib/billing/plans";

/**
 * POST /api/stripe/checkout { plan, interval: "month" | "year" }
 * One Stripe Checkout: the $89/mo (or $801/yr) software subscription plus the
 * plan's one-time setup charge. Returns { mode: "demo" } when Stripe isn't configured.
 */
export async function POST(req: Request) {
  const { plan, interval = "month" } = (await req.json()) as { plan: string; interval?: "month" | "year" };
  const def = PLANS.find((p) => p.id === plan);
  if (!def) return NextResponse.json({ error: "Unknown plan" }, { status: 400 });

  const secret = process.env.STRIPE_SECRET_KEY;
  const subPrice = interval === "year" ? process.env.STRIPE_PRICE_ANNUAL : process.env.STRIPE_PRICE_MONTHLY;
  const setupPrice = process.env[def.stripeSetupPriceEnv];
  if (!secret || !subPrice || !setupPrice) return NextResponse.json({ mode: "demo", plan: def.id, interval });

  const stripe = new Stripe(secret);
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      { price: subPrice, quantity: 1 },
      { price: setupPrice, quantity: 1 }, // one-time setup, charged on the first invoice
    ],
    success_url: `${origin}/app/billing?checkout=success`,
    cancel_url: `${origin}/app/billing?checkout=cancel`,
    allow_promotion_codes: true,
    subscription_data: { metadata: { plan: def.id } },
    // TODO(production): customer / client_reference_id / metadata.org_id from the signed-in user.
  });
  return NextResponse.json({ mode: "live", url: session.url });
}
