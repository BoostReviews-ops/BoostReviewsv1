/**
 * BoostReviewsAI — core domain types.
 *
 * These types are shared by the demo provider (seeded data) and the future
 * Google Business Profile provider. Anything that reaches the UI goes through
 * these shapes, so swapping providers never requires UI changes.
 */

export type Sentiment = "positive" | "neutral" | "negative";
export type ResponseStatus = "responded" | "unanswered" | "draft" | "approved";
export type Plan = "starter" | "growth" | "premium";

export interface Organization {
  id: string;
  name: string;
  type: "business" | "agency";
}

export interface Business {
  id: string;
  orgId: string;
  name: string;
  category: string;
  address: string;
  city: string;
  phone: string;
  website: string;
  googlePlaceId: string | null;
  timezone: string;
  customerSince: string; // ISO date
  locations: Location[];
}

export interface Location {
  id: string;
  businessId: string;
  name: string;
  address: string;
  isPrimary: boolean;
}

export interface Review {
  id: string;
  locationId: string;
  reviewerName: string;
  reviewerInitials: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  date: string; // ISO datetime
  sentiment: Sentiment;
  themes: string[];
  response: ReviewResponse | null;
  source: "google";
}

export interface ReviewResponse {
  text: string;
  date: string; // ISO datetime
  status: ResponseStatus;
  aiAssisted: boolean;
}

export interface ThemeStat {
  key: string;
  label: string;
  polarity: "positive" | "negative";
  /** share (0–1) of recent reviews mentioning the theme */
  share: number;
  /** count of mentions in current period */
  count: number;
  /** change vs previous period, as a fraction (0.21 = +21%) */
  change: number;
  examples: string[];
}

export interface DailyTaps {
  date: string; // YYYY-MM-DD
  taps: number;
}

export interface TapEvent {
  id: string;
  cardId: string;
  timestamp: string;
  device: "iPhone" | "Android" | "Other";
  source: "nfc" | "qr" | "link";
}

export interface ReviewCard {
  id: string;
  locationId: string;
  slug: string;
  label: string;
  status: "active" | "paused";
  destinationType: "google_review" | "custom";
  destinationUrl: string;
  installedAt: string;
}

export interface Competitor {
  id: string;
  name: string;
  category: string;
  distanceMiles: number;
  rating: number;
  totalReviews: number;
  reviewsThisMonth: number;
  reviewsLastMonth: number;
  /** last 6 months of new reviews, oldest first */
  monthlyHistory: number[];
  isYou?: boolean;
}

export interface ScoreFactor {
  key: string;
  label: string;
  /** contribution to the 0–100 score */
  points: number;
  maxPoints: number;
  /** change in contribution vs prior period */
  delta: number;
  explanation: string;
}

export interface ScoreSnapshot {
  date: string; // YYYY-MM-DD
  score: number;
}

export interface ProfileHealthCheck {
  key: string;
  label: string;
  status: "pass" | "warn" | "fail";
  detail: string;
  points: number;
  maxPoints: number;
  href?: string;
}

export interface RecommendedAction {
  id: string;
  title: string;
  why: string;
  impact: "high" | "medium" | "low";
  effort: "5 min" | "15 min" | "30 min" | "1 hour";
  href: string;
  cta: string;
  category: "reviews" | "nfc" | "profile" | "competitors" | "photos";
  completedAt?: string | null;
}

export interface MonthlyReport {
  id: string;
  periodLabel: string;
  periodStart: string;
  periodEnd: string;
  reputationScore: number;
  scoreChange: number;
  googleRating: number;
  reviewsGained: number;
  reviewGrowth: number;
  responseRate: number;
  nfcTaps: number;
  nfcChange: number;
  topPositiveThemes: string[];
  emergingNegativeThemes: string[];
  competitorSummary: string;
  actionsCompleted: string[];
  recommendedNextSteps: string[];
  executiveSummary: string;
}

export interface Subscription {
  plan: Plan;
  status: "active" | "trialing" | "past_due" | "canceled" | "demo";
  currentPeriodEnd: string;
  paymentMethod: { brand: string; last4: string; expMonth: number; expYear: number } | null;
  priceMonthly: number;
}

export interface WebsiteLead {
  id: string;
  businessId: string;
  contactName: string;
  email: string;
  phone: string;
  websiteUrl: string;
  notes: string;
  createdAt: string;
  status: "new" | "contacted" | "closed";
}

export type DateRangeKey = "7d" | "30d" | "90d" | "12m";

export interface PeriodMetrics {
  rangeKey: DateRangeKey;
  label: string;
  reviewsGained: number;
  reviewsPrevious: number;
  reviewGrowth: number; // fraction
  avgRating: number;
  responseRate: number; // fraction
  responseRatePrevious: number;
  nfcTaps: number;
  nfcTapsPrevious: number;
  nfcChange: number; // fraction
  unanswered: number;
  negativeCount: number;
}
