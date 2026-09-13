import type { Plan } from "@/lib/types";

/**
 * Configurable subscription plans. Prices are defaults; in production each
 * plan maps to a Stripe Price via the STRIPE_PRICE_* environment variables so
 * pricing can change without a deploy.
 */
export interface PlanDefinition {
  id: Plan;
  name: string;
  priceMonthly: number;
  tagline: string;
  features: string[];
  highlight?: boolean;
  stripePriceEnv: string;
}

export const PLANS: PlanDefinition[] = [
  {
    id: "starter",
    name: "Starter",
    priceMonthly: Number(process.env.NEXT_PUBLIC_PLAN_STARTER_PRICE ?? 149),
    tagline: "Collect reviews and see where you stand.",
    features: ["NFC review card + QR redirect", "Reputation Score & alerts", "Review inbox with AI reply drafts", "Google Profile Health", "Monthly report"],
    stripePriceEnv: "STRIPE_PRICE_STARTER",
  },
  {
    id: "growth",
    name: "Growth",
    priceMonthly: Number(process.env.NEXT_PUBLIC_PLAN_GROWTH_PRICE ?? 199),
    tagline: "Understand customers and outpace competitors.",
    features: ["Everything in Starter", "Customer sentiment & themes", "Competitor intelligence (5 tracked)", "Next Best Action recommendations", "Priority support"],
    highlight: true,
    stripePriceEnv: "STRIPE_PRICE_GROWTH",
  },
  {
    id: "premium",
    name: "Premium",
    priceMonthly: Number(process.env.NEXT_PUBLIC_PLAN_PREMIUM_PRICE ?? 299),
    tagline: "We manage your reputation for you.",
    features: ["Everything in Growth", "Managed review responses (we reply for you)", "Up to 3 locations", "Monthly strategy call", "Website care add-on eligible"],
    stripePriceEnv: "STRIPE_PRICE_PREMIUM",
  },
];

export function getPlan(id: Plan) {
  return PLANS.find((p) => p.id === id) ?? PLANS[1];
}
