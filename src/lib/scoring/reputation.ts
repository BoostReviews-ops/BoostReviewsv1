/**
 * BoostReviews.AI Reputation Score (proprietary, 0–100).
 *
 * This is NOT a Google score. It blends nine signals into a single number a
 * business owner can track like a fitness score. Each factor is capped so no
 * single signal dominates, and every factor carries a plain-English
 * explanation so the owner understands what is helping or hurting.
 */
import type { ScoreFactor } from "@/lib/types";

export interface ReputationInputs {
  googleRating: number; // 1–5
  avgMonthlyReviews90d: number; // reviews per 30 days over trailing 90 days
  reviewGrowth: number; // fraction, last 30d vs prior 3-month avg
  responseRate: number; // fraction, trailing 90 days
  avgResponseHours: number; // trailing 90 days
  avgRecentRating: number; // trailing 90 days
  profileHealth: number; // 0–100
  nfcTaps30d: number;
  competitorGrowthRank: number; // 1 = fastest growing among tracked set
  ratingRank: number; // 1 = highest rated among tracked set
  trackedCount: number; // you + competitors
  topCompetitorName?: string;
  topCompetitorExtraReviews?: number;
}

export const SCORE_WEIGHTS = {
  rating: 25,
  velocity: 15,
  growth: 10,
  responseRate: 15,
  responseSpeed: 8,
  sentiment: 10,
  profileHealth: 7,
  nfc: 5,
  competitive: 5,
} as const;

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const round = (n: number) => Math.round(n + 1e-9);

export function scoreCategory(score: number): { label: string; tone: "excellent" | "strong" | "good" | "attention" | "risk" } {
  if (score >= 90) return { label: "Excellent", tone: "excellent" };
  if (score >= 80) return { label: "Strong", tone: "strong" };
  if (score >= 70) return { label: "Good", tone: "good" };
  if (score >= 60) return { label: "Needs Attention", tone: "attention" };
  return { label: "At Risk", tone: "risk" };
}

export function computeFactorPoints(i: ReputationInputs): Record<keyof typeof SCORE_WEIGHTS, number> {
  const n = Math.max(2, i.trackedCount);
  const growthPos = 1 - (i.competitorGrowthRank - 1) / (n - 1);
  const ratingPos = 1 - (i.ratingRank - 1) / (n - 1);
  return {
    rating: round(SCORE_WEIGHTS.rating * clamp01((i.googleRating - 3) / 2)),
    velocity: round(SCORE_WEIGHTS.velocity * clamp01(i.avgMonthlyReviews90d / 35)),
    growth: round(SCORE_WEIGHTS.growth * clamp01(0.5 + 1.5 * i.reviewGrowth)),
    responseRate: round(SCORE_WEIGHTS.responseRate * clamp01((i.responseRate - 0.5) / 0.5)),
    responseSpeed: round(SCORE_WEIGHTS.responseSpeed * clamp01(1 - (i.avgResponseHours - 12) / 108)),
    sentiment: round(SCORE_WEIGHTS.sentiment * clamp01((i.avgRecentRating - 4.0) / 0.9)),
    profileHealth: round(SCORE_WEIGHTS.profileHealth * clamp01(i.profileHealth / 100)),
    nfc: round(SCORE_WEIGHTS.nfc * clamp01(i.nfcTaps30d / 180)),
    competitive: round(SCORE_WEIGHTS.competitive * (0.6 * growthPos + 0.4 * ratingPos)),
  };
}

export interface ReputationScoreResult {
  score: number;
  previousScore: number;
  change: number;
  category: ReturnType<typeof scoreCategory>;
  factors: ScoreFactor[];
  /** Grouped, human-readable explanation of the change (sums to `change`). */
  changeReasons: { label: string; points: number }[];
}

function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

export function computeReputationScore(current: ReputationInputs, previous: ReputationInputs): ReputationScoreResult {
  const cur = computeFactorPoints(current);
  const prev = computeFactorPoints(previous);
  const sum = (p: typeof cur) => Object.values(p).reduce((a, b) => a + b, 0);
  const score = sum(cur);
  const previousScore = sum(prev);

  const factors: ScoreFactor[] = [
    {
      key: "rating",
      label: "Google rating",
      points: cur.rating,
      maxPoints: SCORE_WEIGHTS.rating,
      delta: cur.rating - prev.rating,
      explanation: `Your ${current.googleRating.toFixed(1)} rating is ${current.googleRating >= 4.7 ? "well above" : current.googleRating >= 4.4 ? "above" : "near"} the 4.4 local-business average.`,
    },
    {
      key: "velocity",
      label: "Review velocity",
      points: cur.velocity,
      maxPoints: SCORE_WEIGHTS.velocity,
      delta: cur.velocity - prev.velocity,
      explanation: `Averaging ${current.avgMonthlyReviews90d.toFixed(0)} new reviews a month over the last 90 days.`,
    },
    {
      key: "growth",
      label: "Review growth",
      points: cur.growth,
      maxPoints: SCORE_WEIGHTS.growth,
      delta: cur.growth - prev.growth,
      explanation: `New reviews are ${current.reviewGrowth >= 0 ? "up" : "down"} ${pct(Math.abs(current.reviewGrowth))} versus your prior 3-month average.`,
    },
    {
      key: "responseRate",
      label: "Response rate",
      points: cur.responseRate,
      maxPoints: SCORE_WEIGHTS.responseRate,
      delta: cur.responseRate - prev.responseRate,
      explanation: `You've answered ${pct(current.responseRate)} of reviews from the last 90 days (was ${pct(previous.responseRate)}).`,
    },
    {
      key: "responseSpeed",
      label: "Response speed",
      points: cur.responseSpeed,
      maxPoints: SCORE_WEIGHTS.responseSpeed,
      delta: cur.responseSpeed - prev.responseSpeed,
      explanation: `Typical reply time is about ${Math.round(current.avgResponseHours)} hours. Under 24 hours is ideal.`,
    },
    {
      key: "sentiment",
      label: "Recent sentiment",
      points: cur.sentiment,
      maxPoints: SCORE_WEIGHTS.sentiment,
      delta: cur.sentiment - prev.sentiment,
      explanation: `Reviews from the last 90 days average ${current.avgRecentRating.toFixed(2)} stars (prior period ${previous.avgRecentRating.toFixed(2)}).`,
    },
    {
      key: "profileHealth",
      label: "Google Profile Health",
      points: cur.profileHealth,
      maxPoints: SCORE_WEIGHTS.profileHealth,
      delta: cur.profileHealth - prev.profileHealth,
      explanation: `Profile Health is ${current.profileHealth}/100. Fresh photos would close the remaining gap.`,
    },
    {
      key: "nfc",
      label: "NFC engagement",
      points: cur.nfc,
      maxPoints: SCORE_WEIGHTS.nfc,
      delta: cur.nfc - prev.nfc,
      explanation: `${current.nfcTaps30d} review-card taps in the last 30 days (${previous.nfcTaps30d} the month before).`,
    },
    {
      key: "competitive",
      label: "Competitive position",
      points: cur.competitive,
      maxPoints: SCORE_WEIGHTS.competitive,
      delta: cur.competitive - prev.competitive,
      explanation:
        current.competitorGrowthRank === 1
          ? "You are the fastest-growing business among those tracked."
          : `${current.topCompetitorName ?? "A competitor"} gained ${current.topCompetitorExtraReviews ?? "more"} more reviews than you this month.`,
    },
  ];

  const growthDelta = (cur.velocity - prev.velocity) + (cur.growth - prev.growth);
  const reasons: { label: string; points: number }[] = [];
  if (growthDelta !== 0) reasons.push({ label: growthDelta > 0 ? "Strong review growth" : "Slower review growth", points: growthDelta });
  const rrDelta = cur.responseRate - prev.responseRate + (cur.responseSpeed - prev.responseSpeed);
  if (rrDelta !== 0) reasons.push({ label: rrDelta > 0 ? "Improved response rate" : "Lower response rate", points: rrDelta });
  const sDelta = cur.sentiment - prev.sentiment;
  if (sDelta !== 0) reasons.push({ label: sDelta > 0 ? "Better recent sentiment" : "Weaker recent sentiment", points: sDelta });
  const nDelta = cur.nfc - prev.nfc;
  if (nDelta !== 0) reasons.push({ label: nDelta > 0 ? "Strong NFC engagement" : "Lower NFC engagement", points: nDelta });
  const hDelta = cur.profileHealth - prev.profileHealth;
  if (hDelta !== 0) reasons.push({ label: hDelta > 0 ? "Healthier Google profile" : "Google profile needs care", points: hDelta });
  const rDelta = cur.rating - prev.rating;
  if (rDelta !== 0) reasons.push({ label: rDelta > 0 ? "Higher Google rating" : "Lower Google rating", points: rDelta });
  const cDelta = cur.competitive - prev.competitive;
  if (cDelta !== 0) reasons.push({ label: cDelta > 0 ? "Gaining on competitors" : "Competitor gaining reviews faster", points: cDelta });
  reasons.sort((a, b) => b.points - a.points);

  return {
    score,
    previousScore,
    change: score - previousScore,
    category: scoreCategory(score),
    factors,
    changeReasons: reasons,
  };
}
