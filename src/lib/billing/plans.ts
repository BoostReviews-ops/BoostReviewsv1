import type { Plan } from "@/lib/types";

/**
 * Pricing. Every plan runs on the same $89/mo software subscription; the
 * first payment is a one-time setup charge that differs by plan. Annual prepay
 * is 9 months for 12 (3 free). In production each amount maps to a Stripe
 * Price via the STRIPE_PRICE_* env vars so numbers can change without a deploy.
 */
export const MONTHLY_PRICE = Number(process.env.NEXT_PUBLIC_PLAN_MONTHLY ?? 89);
export const ANNUAL_PRICE = Number(process.env.NEXT_PUBLIC_PLAN_ANNUAL ?? MONTHLY_PRICE * 9);
export const ANNUAL_PER_MONTH = Math.round((ANNUAL_PRICE / 12) * 100) / 100; // 66.75

export interface PlanDefinition {
  id: Plan;
  name: string;
  setupFee: number;
  priceMonthly: number;
  tagline: string;
  features: string[];
  highlight?: boolean;
  cta: string;
  /** Stripe Price for the one-time setup charge */
  stripeSetupPriceEnv: string;
}

const CORE = [
  "Connect your Google Business Profile in minutes",
  "One score that tells you how your reputation is doing",
  "Every review in one inbox, with a reply already written for you. Tap approve, done.",
  "See what customers love and what they complain about",
  "A checklist showing what to fix on your Google listing",
  "A simple report every month",
];

export const PLANS: PlanDefinition[] = [
  {
    id: "starter",
    name: "Connect",
    setupFee: Number(process.env.NEXT_PUBLIC_PLAN_CONNECT_SETUP ?? 129),
    priceMonthly: MONTHLY_PRICE,
    tagline: "Plug your business in and see where you stand.",
    features: CORE,
    cta: "Get started",
    stripeSetupPriceEnv: "STRIPE_PRICE_SETUP_CONNECT",
  },
  {
    id: "growth",
    name: "Pro",
    setupFee: Number(process.env.NEXT_PUBLIC_PLAN_PRO_SETUP ?? 179.99),
    priceMonthly: MONTHLY_PRICE,
    tagline: "We set you up to get more reviews and look your best on Google.",
    features: [
      ...CORE,
      "Tap-to-review card for your counter, hand delivered and set up for you",
      "We clean up your Google listing to the highest standard: photos, services, categories, hours, description, Q&A",
      "We set it up so more customers find you and choose you",
      "Track how many people tap the card and how many reviews it brings in",
    ],
    highlight: true,
    cta: "Get started",
    stripeSetupPriceEnv: "STRIPE_PRICE_SETUP_PRO",
  },
  {
    id: "premium",
    name: "Website Upgrade",
    setupFee: Number(process.env.NEXT_PUBLIC_PLAN_WEBSITE_SETUP ?? 399),
    priceMonthly: MONTHLY_PRICE,
    tagline: "Everything in Pro, plus a website that turns visitors into customers.",
    features: [
      "Everything in Pro, card included",
      "A simple, professional website in 3–7 days, on your own domain",
      "Works great on phones, with tap-to-call and online booking",
      "Your Google reviews shown right on your site",
      "Hosting, security and small monthly edits included",
    ],
    cta: "Talk to us",
    stripeSetupPriceEnv: "STRIPE_PRICE_SETUP_WEBSITE",
  },
];

export function getPlan(id: Plan) {
  return PLANS.find((p) => p.id === id) ?? PLANS[1];
}

export function formatMoney(n: number) {
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;
}
