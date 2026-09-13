/**
 * Seeded demo dataset for the demo customer: Royal Massage & Spa.
 *
 * Everything here is deterministic (seeded PRNG) and generated relative to
 * "today", so the demo always shows a live-looking business with several
 * months of history. Nothing in this file talks to Google — it exists so the
 * sales demo works with zero external credentials.
 */
import {
  FIRST_NAMES,
  LAST_INITIALS,
  MIXED_3,
  NEGATIVE_12,
  POSITIVE_4,
  POSITIVE_5,
  POSITIVE_5_SHORT,
  RESPONSE_TEMPLATES_MIXED,
  RESPONSE_TEMPLATES_NEGATIVE,
  RESPONSE_TEMPLATES_POSITIVE,
  THERAPISTS,
  type BankEntry,
} from "./reviewBank";
import type {
  Business,
  Competitor,
  DailyTaps,
  MonthlyReport,
  Organization,
  RecommendedAction,
  Review,
  ReviewCard,
  ScoreSnapshot,
  Subscription,
  TapEvent,
} from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Deterministic PRNG                                                  */
/* ------------------------------------------------------------------ */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/* Date helpers                                                        */
/* ------------------------------------------------------------------ */

/** Start of today (local). All demo data is anchored to this. */
export function demoToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function daysAgo(n: number, from: Date = demoToday()): Date {
  const d = new Date(from);
  d.setDate(d.getDate() - n);
  return d;
}

export function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* ------------------------------------------------------------------ */
/* Static entities                                                     */
/* ------------------------------------------------------------------ */

export const DEMO_ORG: Organization = {
  id: "org_demo_royal",
  name: "Royal Massage & Spa",
  type: "business",
};

export const DEMO_BUSINESS: Business = {
  id: "biz_royal_massage_spa",
  orgId: DEMO_ORG.id,
  name: "Royal Massage & Spa",
  category: "Massage spa",
  address: "1420 Westgate Blvd, Suite 110",
  city: "Austin, TX 78745",
  phone: "(512) 555-0148",
  website: "https://royalmassageandspa.com",
  googlePlaceId: null,
  timezone: "America/Chicago",
  customerSince: ymd(daysAgo(152)),
  locations: [
    {
      id: "loc_royal_westgate",
      businessId: "biz_royal_massage_spa",
      name: "Westgate",
      address: "1420 Westgate Blvd, Suite 110, Austin, TX",
      isPrimary: true,
    },
  ],
};

export const DEMO_GOOGLE_RATING = 4.8;
export const DEMO_TOTAL_REVIEWS = 426;

export const DEMO_REVIEW_CARD: ReviewCard = {
  id: "card_royal_front_desk",
  locationId: "loc_royal_westgate",
  slug: "royal-spa",
  label: "Front desk review stand",
  status: "active",
  destinationType: "google_review",
  destinationUrl: "https://search.google.com/local/writereview?placeid=ChIJdemoRoyalMassageSpa",
  installedAt: ymd(daysAgo(150)),
};

/* ------------------------------------------------------------------ */
/* Reviews                                                             */
/* ------------------------------------------------------------------ */

/** New reviews per rolling 30-day window, most recent first (12 months). */
export const MONTHLY_REVIEW_COUNTS = [31, 25, 27, 24, 22, 21, 20, 19, 18, 17, 16, 15];

/** Unanswered reviews per window (story: response discipline improved after onboarding). */
const UNANSWERED_PER_WINDOW = [3, 1, 1, 5, 6, 7, 8, 8, 9, 8, 8, 7];

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

/** Draw without replacement; reshuffles when exhausted so texts rarely repeat. */
function makeDeck<T>(rng: () => number, items: T[]) {
  let pool: T[] = [];
  return () => {
    if (!pool.length) {
      pool = [...items];
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
    }
    return pool.pop() as T;
  };
}

function fill(text: string, name: string, therapist: string) {
  return text.replaceAll("{N}", name).replaceAll("{T}", therapist);
}

interface Quota {
  five: number;
  four: number;
  three: number;
  neg: number;
}

function quotaFor(n: number, windowIndex: number): Quota {
  // Recent windows skew slightly more positive (story: sentiment improving).
  const recent = windowIndex <= 2;
  const five = Math.round(n * (recent ? 0.87 : 0.84));
  const four = Math.round(n * 0.08);
  const three = Math.max(0, Math.round(n * (recent ? 0.03 : 0.04)));
  const neg = Math.max(0, n - five - four - three);
  return { five, four, three, neg };
}

export function generateReviews(): Review[] {
  const rng = mulberry32(20260913);
  const today = demoToday();
  const reviews: Review[] = [];
  const usedNames = new Set<string>();

  const nextName = () => {
    for (let i = 0; i < 50; i++) {
      const name = `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_INITIALS)}.`;
      if (!usedNames.has(name)) {
        usedNames.add(name);
        return name;
      }
    }
    return `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_INITIALS)}.`;
  };

  let idCounter = 1000;
  const fiveDeck = makeDeck(rng, [...POSITIVE_5, ...POSITIVE_5_SHORT]);
  const fourDeck = makeDeck(rng, POSITIVE_4);
  const threeDeck = makeDeck(rng, MIXED_3);

  MONTHLY_REVIEW_COUNTS.forEach((count, w) => {
    const q = quotaFor(count, w);
    const entries: BankEntry[] = [];

    // Recent windows over-index on wait-time mentions (story: emerging issue).
    const waitBias = w <= 2 ? 0.75 : 0.2;
    const withWait = (pool: BankEntry[], draw: () => BankEntry) => {
      if (rng() < waitBias) {
        const waitPool = pool.filter((e) => e.themes.includes("wait"));
        if (waitPool.length) return pick(rng, waitPool);
      }
      return draw();
    };

    for (let i = 0; i < q.five; i++) entries.push(fiveDeck());
    for (let i = 0; i < q.four; i++) entries.push(withWait(POSITIVE_4, fourDeck));
    for (let i = 0; i < q.three; i++) entries.push(withWait(MIXED_3, threeDeck));
    for (let i = 0; i < q.neg; i++) {
      // Keep the demo's headline negatives at 2 stars in the recent windows;
      // the current window always gets the wait-time complaint (best AI-reply showcase).
      const pool = w <= 2 ? NEGATIVE_12.filter((e) => e.rating === 2) : NEGATIVE_12;
      entries.push(w === 0 && i === 0 ? pool[0] : pick(rng, pool));
    }

    // Assign dates within the window (days w*30 .. w*30+29 ago)
    const dated = entries.map((entry) => {
      const dayOffset = w * 30 + Math.floor(rng() * 30);
      // Today's reviews land in the morning so they are never timestamped in the future.
      const hour = dayOffset === 0 ? 8 + Math.floor(rng() * 3) : 8 + Math.floor(rng() * 13);
      const minute = Math.floor(rng() * 60);
      const d = daysAgo(dayOffset, today);
      d.setHours(hour, minute, 0, 0);
      return { entry, date: d };
    });
    // Ensure the most recent window has a fresh review today/yesterday
    if (w === 0) {
      dated[0].date = daysAgo(0, today);
      dated[0].date.setHours(10, 24, 0, 0);
      dated[1].date = daysAgo(1, today);
      dated[1].date.setHours(16, 5, 0, 0);
    }
    dated.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Decide which reviews are unanswered. Recent window: newest negative,
    // newest 3-star, and newest 5-star so the demo has meaningful work to do.
    const unansweredIdx = new Set<number>();
    const need = UNANSWERED_PER_WINDOW[w];
    if (w === 0) {
      const firstNeg = dated.findIndex((d) => d.entry.rating <= 2);
      const firstThree = dated.findIndex((d) => d.entry.rating === 3);
      const firstFive = dated.findIndex((d) => d.entry.rating === 5);
      [firstNeg, firstThree, firstFive].forEach((i) => i >= 0 && unansweredIdx.add(i));
    }
    let guard = 0;
    while (unansweredIdx.size < need && guard++ < 500) {
      const i = Math.floor(rng() * dated.length);
      if (w <= 2 && dated[i].entry.rating <= 3 && w !== 0) continue; // older-recent windows: only leave 4–5★ unanswered
      unansweredIdx.add(i);
    }

    dated.forEach(({ entry, date }, i) => {
      const name = nextName();
      const first = name.split(" ")[0];
      const therapist = pick(rng, THERAPISTS);
      const text = fill(entry.text, first, therapist);
      const unanswered = unansweredIdx.has(i);

      let response: Review["response"] = null;
      if (!unanswered) {
        const delayHours = w <= 2 ? 8 + rng() * 28 : 14 + rng() * 32; // recent ≈22h, older ≈30h
        const rd = new Date(date.getTime() + delayHours * 3600 * 1000);
        const template =
          entry.rating >= 4
            ? pick(rng, RESPONSE_TEMPLATES_POSITIVE)
            : entry.rating === 3
              ? pick(rng, RESPONSE_TEMPLATES_MIXED)
              : pick(rng, RESPONSE_TEMPLATES_NEGATIVE);
        response = {
          text: fill(template, first, therapist),
          date: rd.toISOString(),
          status: "responded",
          aiAssisted: w <= 4 && rng() < 0.7,
        };
      }

      const initials = name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .replace(".", "");

      reviews.push({
        id: `rev_${idCounter++}`,
        locationId: "loc_royal_westgate",
        reviewerName: name,
        reviewerInitials: initials,
        rating: entry.rating,
        text,
        date: date.toISOString(),
        sentiment: entry.sentiment,
        themes: entry.themes,
        response,
        source: "google",
      });
    });
  });

  reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return reviews;
}

/* ------------------------------------------------------------------ */
/* NFC taps                                                            */
/* ------------------------------------------------------------------ */

/** Taps per rolling 30-day window, most recent first (card installed 150 days ago). */
export const MONTHLY_TAP_TOTALS = [188, 159, 140, 118, 95];

export function generateDailyTaps(): DailyTaps[] {
  const rng = mulberry32(4242);
  const today = demoToday();
  const dowWeight = [0.75, 0.9, 0.95, 1.0, 1.1, 1.35, 1.45]; // Sun..Sat
  const out: DailyTaps[] = [];

  MONTHLY_TAP_TOTALS.forEach((total, w) => {
    const raw: number[] = [];
    for (let i = 0; i < 30; i++) {
      const d = daysAgo(w * 30 + i, today);
      const ramp = w === 0 ? 1 + ((29 - i) / 29) * 0.9 : 1; // recent days trend up
      raw.push(dowWeight[d.getDay()] * (0.7 + rng() * 0.6) * ramp);
    }
    const sum = raw.reduce((a, b) => a + b, 0);
    const scaled = raw.map((r) => Math.floor((r / sum) * total));
    let remainder = total - scaled.reduce((a, b) => a + b, 0);
    // distribute remainder to the largest fractional days
    const order = raw
      .map((r, i) => ({ i, frac: (r / sum) * total - scaled[i] }))
      .sort((a, b) => b.frac - a.frac);
    for (let k = 0; remainder > 0; k = (k + 1) % order.length) {
      scaled[order[k].i] += 1;
      remainder--;
    }
    for (let i = 0; i < 30; i++) {
      out.push({ date: ymd(daysAgo(w * 30 + i, today)), taps: scaled[i] });
    }
  });

  out.sort((a, b) => (a.date < b.date ? -1 : 1));
  return out;
}

export function generateTapEvents(daily: DailyTaps[]): TapEvent[] {
  const rng = mulberry32(777);
  const events: TapEvent[] = [];
  const recent = daily.slice(-10).reverse();
  let n = 0;
  for (const day of recent) {
    for (let i = 0; i < day.taps && events.length < 40; i++) {
      const hour = 9 + Math.floor(rng() * 11);
      const minute = Math.floor(rng() * 60);
      const d = new Date(`${day.date}T00:00:00`);
      d.setHours(hour, minute, 0, 0);
      if (d.getTime() > Date.now()) continue;
      const r = rng();
      events.push({
        id: `tap_${n++}`,
        cardId: DEMO_REVIEW_CARD.id,
        timestamp: d.toISOString(),
        device: r < 0.62 ? "iPhone" : r < 0.95 ? "Android" : "Other",
        source: rng() < 0.85 ? "nfc" : "qr",
      });
    }
  }
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return events;
}

/* ------------------------------------------------------------------ */
/* Competitors                                                         */
/* ------------------------------------------------------------------ */

export const DEMO_COMPETITORS: Competitor[] = [
  {
    id: "comp_serenity",
    name: "Serenity Spa & Wellness",
    category: "Day spa",
    distanceMiles: 1.2,
    rating: 4.6,
    totalReviews: 512,
    reviewsThisMonth: 38,
    reviewsLastMonth: 24,
    monthlyHistory: [19, 21, 22, 23, 24, 38],
  },
  {
    id: "comp_knot",
    name: "The Knot Massage Studio",
    category: "Massage therapist",
    distanceMiles: 0.8,
    rating: 4.7,
    totalReviews: 298,
    reviewsThisMonth: 24,
    reviewsLastMonth: 22,
    monthlyHistory: [17, 18, 20, 21, 22, 24],
  },
  {
    id: "comp_tranquil",
    name: "Tranquil Touch Day Spa",
    category: "Day spa",
    distanceMiles: 2.4,
    rating: 4.5,
    totalReviews: 641,
    reviewsThisMonth: 19,
    reviewsLastMonth: 21,
    monthlyHistory: [24, 23, 22, 22, 21, 19],
  },
  {
    id: "comp_elements",
    name: "Elements Massage — Westgate",
    category: "Massage spa",
    distanceMiles: 0.5,
    rating: 4.4,
    totalReviews: 388,
    reviewsThisMonth: 27,
    reviewsLastMonth: 25,
    monthlyHistory: [22, 23, 23, 24, 25, 27],
  },
  {
    id: "comp_bliss",
    name: "Bliss Body Works",
    category: "Massage therapist",
    distanceMiles: 3.1,
    rating: 4.7,
    totalReviews: 176,
    reviewsThisMonth: 12,
    reviewsLastMonth: 10,
    monthlyHistory: [8, 9, 9, 10, 10, 12],
  },
];

/* ------------------------------------------------------------------ */
/* Score + health history                                              */
/* ------------------------------------------------------------------ */

/** Weekly BoostReviewsAI Reputation Score, oldest → newest (26 weeks). */
const SCORE_SERIES = [70, 71, 71, 72, 72, 73, 74, 74, 75, 76, 76, 77, 77, 78, 79, 79, 80, 80, 81, 81, 81, 81, 83, 85, 86, 87];
/** Weekly Google Profile Health, oldest → newest (26 weeks). */
const HEALTH_SERIES = [78, 78, 79, 80, 80, 81, 82, 82, 83, 83, 84, 85, 85, 86, 86, 87, 87, 88, 88, 88, 88, 89, 89, 90, 91, 91];

function weeklySeries(values: number[]): ScoreSnapshot[] {
  const today = demoToday();
  return values.map((score, i) => ({
    date: ymd(daysAgo((values.length - 1 - i) * 7, today)),
    score,
  }));
}

export const DEMO_SCORE_HISTORY: ScoreSnapshot[] = weeklySeries(SCORE_SERIES);
export const DEMO_HEALTH_HISTORY: ScoreSnapshot[] = weeklySeries(HEALTH_SERIES);

/* ------------------------------------------------------------------ */
/* Actions                                                             */
/* ------------------------------------------------------------------ */

export const DEMO_ACTIONS: RecommendedAction[] = [
  {
    id: "act_respond_unanswered",
    title: "Respond to 5 unanswered reviews",
    why: "Improving response coverage strengthens customer trust and lifts both your Reputation Score and Google Profile Health. Three of these arrived in the last two weeks.",
    impact: "high",
    effort: "15 min",
    href: "/app/reviews?filter=unanswered",
    cta: "Open unanswered reviews",
    category: "reviews",
  },
  {
    id: "act_review_requests",
    title: "Generate about 8 additional review opportunities this week",
    why: "Serenity Spa & Wellness gained 7 more reviews than you this month. Moving the review stand to checkout and asking at the end of each visit typically adds 6–10 reviews a month.",
    impact: "high",
    effort: "5 min",
    href: "/app/review-card",
    cta: "See review card tips",
    category: "nfc",
  },
  {
    id: "act_upload_photos",
    title: "Upload recent business photos",
    why: "Your Google Profile Health shows photos haven't been refreshed in 47 days. Profiles with recent photos tend to earn more clicks and calls.",
    impact: "medium",
    effort: "15 min",
    href: "/app/google-profile",
    cta: "View profile health",
    category: "photos",
  },
];

export const DEMO_COMPLETED_ACTIONS: RecommendedAction[] = [
  {
    id: "act_done_1",
    title: "Responded to 4 reviews from last week",
    why: "Kept response coverage above 90%.",
    impact: "high",
    effort: "15 min",
    href: "/app/reviews",
    cta: "View",
    category: "reviews",
    completedAt: daysAgo(6).toISOString(),
  },
  {
    id: "act_done_2",
    title: "Moved review stand to the checkout counter",
    why: "Taps increased 18% in the following weeks.",
    impact: "high",
    effort: "5 min",
    href: "/app/review-card",
    cta: "View",
    category: "nfc",
    completedAt: daysAgo(24).toISOString(),
  },
  {
    id: "act_done_3",
    title: "Updated holiday hours on Google",
    why: "Business info completeness restored to 100%.",
    impact: "medium",
    effort: "5 min",
    href: "/app/google-profile",
    cta: "View",
    category: "profile",
    completedAt: daysAgo(38).toISOString(),
  },
  {
    id: "act_done_4",
    title: "Added 'Prenatal Massage' to listed services",
    why: "Services list now matches the booking menu.",
    impact: "medium",
    effort: "15 min",
    href: "/app/google-profile",
    cta: "View",
    category: "profile",
    completedAt: daysAgo(52).toISOString(),
  },
];

/* ------------------------------------------------------------------ */
/* Historical monthly reports (the current one is computed live)       */
/* ------------------------------------------------------------------ */

function monthLabel(d: Date) {
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function historicalReports(): MonthlyReport[] {
  const today = demoToday();
  const prev1 = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const prev2 = new Date(today.getFullYear(), today.getMonth() - 2, 1);
  const endOf = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return [
    {
      id: `report_${ymd(prev1)}`,
      periodLabel: monthLabel(prev1),
      periodStart: ymd(prev1),
      periodEnd: ymd(endOf(prev1)),
      reputationScore: 81,
      scoreChange: 2,
      googleRating: 4.8,
      reviewsGained: 25,
      reviewGrowth: 0.03,
      responseRate: 0.91,
      nfcTaps: 159,
      nfcChange: 0.14,
      topPositiveThemes: ["Massage quality", "Staff friendliness", "Cleanliness"],
      emergingNegativeThemes: ["Booking availability"],
      competitorSummary: "You ranked #1 of 6 tracked businesses for review growth. Serenity Spa & Wellness was close behind at 24 new reviews.",
      actionsCompleted: ["Moved review stand to the checkout counter", "Updated holiday hours on Google"],
      recommendedNextSteps: ["Respond to reviews within 24 hours", "Open more weekend booking slots", "Refresh Google photos"],
      executiveSummary:
        "A steady month. Review volume held around 25 with a strong 4.8 rating, response coverage climbed to 91%, and moving the review stand to checkout started paying off in the final week.",
    },
    {
      id: `report_${ymd(prev2)}`,
      periodLabel: monthLabel(prev2),
      periodStart: ymd(prev2),
      periodEnd: ymd(endOf(prev2)),
      reputationScore: 79,
      scoreChange: 3,
      googleRating: 4.8,
      reviewsGained: 27,
      reviewGrowth: 0.13,
      responseRate: 0.88,
      nfcTaps: 140,
      nfcChange: 0.19,
      topPositiveThemes: ["Massage quality", "Atmosphere", "Staff friendliness"],
      emergingNegativeThemes: ["Wait times", "Parking"],
      competitorSummary: "You ranked #1 of 6 tracked businesses for review growth and held the highest rating in the area.",
      actionsCompleted: ["Added 'Prenatal Massage' to listed services"],
      recommendedNextSteps: ["Add a second front-desk team member at peak hours", "Respond to all new reviews within 48 hours"],
      executiveSummary:
        "Review growth jumped 13% as the NFC review stand gained traction. Response coverage improved to 88%. Wait-time mentions started appearing in weekend reviews.",
    },
  ];
}

/* ------------------------------------------------------------------ */
/* Billing                                                             */
/* ------------------------------------------------------------------ */

export const DEMO_SUBSCRIPTION: Subscription = {
  plan: "growth",
  status: "active",
  currentPeriodEnd: ymd(daysAgo(-17)),
  paymentMethod: { brand: "Visa", last4: "4242", expMonth: 8, expYear: 2028 },
  priceMonthly: 89,
};

/* ------------------------------------------------------------------ */
/* Assembled dataset                                                   */
/* ------------------------------------------------------------------ */

export interface DemoDataset {
  org: Organization;
  business: Business;
  googleRating: number;
  totalReviews: number;
  reviews: Review[];
  dailyTaps: DailyTaps[];
  tapEvents: TapEvent[];
  reviewCard: ReviewCard;
  competitors: Competitor[];
  scoreHistory: ScoreSnapshot[];
  healthHistory: ScoreSnapshot[];
  actions: RecommendedAction[];
  completedActions: RecommendedAction[];
  historicalReports: MonthlyReport[];
  subscription: Subscription;
  photosLastUpdatedDaysAgo: number;
  lastPostDaysAgo: number;
}

let cached: DemoDataset | null = null;
let cachedDay = "";

export function getDemoDataset(): DemoDataset {
  const day = ymd(demoToday());
  if (cached && cachedDay === day) return cached;
  const reviews = generateReviews();
  const dailyTaps = generateDailyTaps();
  cached = {
    org: DEMO_ORG,
    business: DEMO_BUSINESS,
    googleRating: DEMO_GOOGLE_RATING,
    totalReviews: DEMO_TOTAL_REVIEWS,
    reviews,
    dailyTaps,
    tapEvents: generateTapEvents(dailyTaps),
    reviewCard: DEMO_REVIEW_CARD,
    competitors: DEMO_COMPETITORS,
    scoreHistory: DEMO_SCORE_HISTORY,
    healthHistory: DEMO_HEALTH_HISTORY,
    actions: DEMO_ACTIONS,
    completedActions: DEMO_COMPLETED_ACTIONS,
    historicalReports: historicalReports(),
    subscription: DEMO_SUBSCRIPTION,
    photosLastUpdatedDaysAgo: 47,
    lastPostDaysAgo: 12,
  };
  cachedDay = day;
  return cached;
}
