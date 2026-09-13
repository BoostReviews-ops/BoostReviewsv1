import type { Plan } from "@/lib/types";

/**
 * Subscription plans. Prices are defaults; in production each plan maps to a
 * Stripe Price via STRIPE_PRICE_* so pricing can change without a deploy.
 */
export interface PlanDefinition {
  id: Plan;
  name: string;
  priceMonthly: number;
  /** One-time fee charged at signup (Stripe: a second one-time price on the same checkout). */
  setupFee?: number;
  tagline: string;
  features: string[];
  highlight?: boolean;
  stripePriceEnv: string;
  stripeSetupPriceEnv?: string;
}

export const PLANS: PlanDefinition[] = [
  {
    id: "starter",
    name: "Starter",
    priceMonthly: Number(process.env.NEXT_PUBLIC_PLAN_STARTER_PRICE ?? 99),
    tagline: "Collect more reviews and answer them in one tap.",
    features: [
      "NFC review card + QR stand for your counter",
      "Reputation Score with plain-English explanations",
      "Review inbox with AI-drafted replies you approve",
      "Customer sentiment and recurring themes",
      "Google Profile Health checklist",
      "Monthly reputation report",
    ],
    stripePriceEnv: "STRIPE_PRICE_STARTER",
  },
  {
    id: "growth",
    name: "Managed",
    priceMonthly: Number(process.env.NEXT_PUBLIC_PLAN_GROWTH_PRICE ?? 199),
    tagline: "We run your Google profile for you.",
    features: [
      "Everything in Starter",
      "Full Google Business Profile cleanup to the highest standard",
      "Photo uploads every month, professionally curated",
      "Services, categories, hours, description and Q&A optimized",
      "Weekly Google posts and offers to keep the profile active",
      "We reply to every review within 24 hours",
      "Competitor tracking with a monthly strategy note",
    ],
    highlight: true,
    stripePriceEnv: "STRIPE_PRICE_GROWTH",
  },
  {
    id: "premium",
    name: "Complete",
    priceMonthly: Number(process.env.NEXT_PUBLIC_PLAN_PREMIUM_PRICE ?? 388),
    setupFee: Number(process.env.NEXT_PUBLIC_PLAN_PREMIUM_SETUP ?? 399),
    tagline: "Managed reputation plus a website that converts.",
    features: [
      "Everything in Managed",
      "Professional website built for your business, on your own domain",
      "Mobile-first design with click-to-call and online booking",
      "Hosting, security updates and monthly edits included",
      "Google profile and website linked so reviews show on your site",
      "Priority support",
    ],
    stripePriceEnv: "STRIPE_PRICE_PREMIUM",
    stripeSetupPriceEnv: "STRIPE_PRICE_PREMIUM_SETUP",
  },
];

/** Breakdown shown next to the Complete plan: Managed + website care. */
export const COMPLETE_BREAKDOWN = { managed: 199, websiteMonthly: 189, websiteSetup: 399 };

export function getPlan(id: Plan) {
  return PLANS.find((p) => p.id === id) ?? PLANS[1];
}
