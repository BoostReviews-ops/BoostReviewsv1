import { NextResponse } from "next/server";
import Stripe from "stripe";
import { PLANS } from "@/lib/billing/plans";

/**
 * POST /api/stripe/checkout — create a Stripe Checkout session for a plan.
 * Returns { mode: "demo" } when Stripe isn't configured so the UI can simulate.
 */
export async function POST(req: Request) {
  const { plan } = (await req.json()) as { plan: string };
  const def = PLANS.find((p) => p.id === plan);
  if (!def) return NextResponse.json({ error: "Unknown plan" }, { status: 400 });

  const secret = process.env.STRIPE_SECRET_KEY;
  const price = process.env[def.stripePriceEnv];
  if (!secret || !price) return NextResponse.json({ mode: "demo", plan: def.id });

  const stripe = new Stripe(secret);
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    success_url: `${origin}/app/billing?checkout=success`,
    cancel_url: `${origin}/app/billing?checkout=cancel`,
    allow_promotion_codes: true,
    // TODO(production): customer / client_reference_id from the signed-in user.
  });
  return NextResponse.json({ mode: "live", url: session.url });
}
