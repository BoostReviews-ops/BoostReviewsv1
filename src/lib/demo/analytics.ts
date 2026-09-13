/**
 * Pure analytics over the domain types. Works for the demo provider today and
 * for real Google data later — it only depends on Review[] / DailyTaps[] etc.
 */
import type { Competitor, DailyTaps, DateRangeKey, PeriodMetrics, Review, ThemeStat } from "@/lib/types";
import { THEME_LABELS } from "./reviewBank";
import { demoToday, daysAgo, ymd } from "./seed";

export const RANGE_DAYS: Record<DateRangeKey, number> = { "7d": 7, "30d": 30, "90d": 90, "12m": 365 };
export const RANGE_LABELS: Record<DateRangeKey, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  "12m": "Last 12 months",
};

export function reviewsInWindow(reviews: Review[], fromDaysAgo: number, toDaysAgo: number, now: Date = demoToday()) {
  // window covers the days `toDaysAgo` .. `fromDaysAgo - 1` ago, inclusive (from > to)
  const start = daysAgo(fromDaysAgo - 1, now).getTime();
  const end = daysAgo(toDaysAgo, now).getTime() + 24 * 3600 * 1000;
  return reviews.filter((r) => {
    const t = new Date(r.date).getTime();
    return t >= start && t < end;
  });
}

export function tapsInWindow(daily: DailyTaps[], fromDaysAgo: number, toDaysAgo: number, now: Date = demoToday()) {
  const start = ymd(daysAgo(fromDaysAgo - 1, now));
  const end = ymd(daysAgo(toDaysAgo, now));
  return daily.filter((d) => d.date >= start && d.date <= end).reduce((a, d) => a + d.taps, 0);
}

export function isAnswered(r: Review) {
  return !!r.response && (r.response.status === "responded" || r.response.status === "approved");
}

export function responseRate(reviews: Review[]) {
  if (!reviews.length) return 0;
  return reviews.filter(isAnswered).length / reviews.length;
}

export function avgRating(reviews: Review[]) {
  if (!reviews.length) return 0;
  return reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
}

export function avgResponseHours(reviews: Review[]) {
  const answered = reviews.filter((r) => isAnswered(r) && r.response);
  if (!answered.length) return 0;
  const total = answered.reduce((a, r) => {
    const h = (new Date(r.response!.date).getTime() - new Date(r.date).getTime()) / 3600000;
    return a + Math.max(0, h);
  }, 0);
  return total / answered.length;
}

export function periodMetrics(reviews: Review[], daily: DailyTaps[], rangeKey: DateRangeKey): PeriodMetrics {
  const days = RANGE_DAYS[rangeKey];
  const current = reviewsInWindow(reviews, days, 0);
  const previous = reviewsInWindow(reviews, days * 2, days);
  const taps = tapsInWindow(daily, days, 0);
  const tapsPrev = tapsInWindow(daily, days * 2, days);

  // Growth: for 30d we compare against the prior 3-month average (more stable);
  // other ranges compare with the immediately preceding period of equal length.
  let reviewsPrevious = previous.length;
  if (rangeKey === "30d") {
    reviewsPrevious = reviewsInWindow(reviews, 120, 30).length / 3;
  }
  const growth = reviewsPrevious > 0 ? current.length / reviewsPrevious - 1 : 0;

  return {
    rangeKey,
    label: RANGE_LABELS[rangeKey],
    reviewsGained: current.length,
    reviewsPrevious: Math.round(reviewsPrevious),
    reviewGrowth: growth,
    avgRating: avgRating(current),
    responseRate: responseRate(current),
    responseRatePrevious: responseRate(previous),
    nfcTaps: taps,
    nfcTapsPrevious: tapsPrev,
    nfcChange: tapsPrev > 0 ? taps / tapsPrev - 1 : 0,
    unanswered: current.filter((r) => !isAnswered(r)).length,
    negativeCount: current.filter((r) => r.rating <= 2).length,
  };
}

/** Theme statistics for a window vs the preceding window of equal length. */
export function themeStats(reviews: Review[], days = 90): ThemeStat[] {
  const current = reviewsInWindow(reviews, days, 0);
  const previous = reviewsInWindow(reviews, days * 2, days);
  const count = (list: Review[], key: string) => list.filter((r) => r.themes.includes(key)).length;
  const examples = (key: string) =>
    current
      .filter((r) => r.themes.includes(key))
      .slice(0, 3)
      .map((r) => r.text);

  return Object.entries(THEME_LABELS)
    .map(([key, meta]) => {
      const c = count(current, key);
      const p = count(previous, key);
      const change = p > 0 ? c / p - 1 : c > 0 ? 1 : 0;
      return {
        key,
        label: meta.label,
        polarity: meta.polarity,
        share: current.length ? c / current.length : 0,
        count: c,
        change,
        examples: examples(key),
      };
    })
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count);
}

export function sentimentBreakdown(reviews: Review[]) {
  const total = reviews.length || 1;
  const pos = reviews.filter((r) => r.sentiment === "positive").length;
  const neu = reviews.filter((r) => r.sentiment === "neutral").length;
  const neg = reviews.filter((r) => r.sentiment === "negative").length;
  return { positive: pos / total, neutral: neu / total, negative: neg / total, counts: { pos, neu, neg } };
}

export function ratingDistribution(reviews: Review[]) {
  const dist = [0, 0, 0, 0, 0];
  reviews.forEach((r) => dist[r.rating - 1]++);
  return dist; // index 0 = 1★ ... 4 = 5★
}

/** Monthly review counts for the last N rolling 30-day windows, oldest first. */
export function monthlyReviewSeries(reviews: Review[], months = 6) {
  const out: { label: string; count: number; date: string }[] = [];
  for (let w = months - 1; w >= 0; w--) {
    const list = reviewsInWindow(reviews, (w + 1) * 30, w * 30);
    const end = daysAgo(w * 30);
    out.push({
      label: end.toLocaleDateString("en-US", { month: "short" }),
      count: list.length,
      date: ymd(end),
    });
  }
  return out;
}

/** Weekly review counts + taps, last N weeks, oldest first. */
export function weeklySeries(reviews: Review[], daily: DailyTaps[], weeks = 12) {
  const out: { label: string; reviews: number; taps: number }[] = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const list = reviewsInWindow(reviews, (w + 1) * 7, w * 7);
    const taps = tapsInWindow(daily, (w + 1) * 7, w * 7);
    const end = daysAgo(w * 7);
    out.push({ label: end.toLocaleDateString("en-US", { month: "short", day: "numeric" }), reviews: list.length, taps });
  }
  return out;
}

export function tapsByWeekday(daily: DailyTaps[], days = 30) {
  const totals = [0, 0, 0, 0, 0, 0, 0];
  const counts = [0, 0, 0, 0, 0, 0, 0];
  const start = ymd(daysAgo(days - 1));
  daily
    .filter((d) => d.date >= start)
    .forEach((d) => {
      const dow = new Date(`${d.date}T00:00:00`).getDay();
      totals[dow] += d.taps;
      counts[dow]++;
    });
  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return names.map((name, i) => ({ day: name, avg: counts[i] ? totals[i] / counts[i] : 0, total: totals[i] }));
}

export interface CompetitorInsight {
  rankByGrowth: number;
  rankByRating: number;
  total: number;
  leader: Competitor | null;
  leaderExtra: number;
  headline: string;
  bullets: string[];
}

export function competitorInsights(you: Competitor, competitors: Competitor[]): CompetitorInsight {
  const all = [you, ...competitors];
  const byGrowth = [...all].sort((a, b) => b.reviewsThisMonth - a.reviewsThisMonth);
  const byRating = [...all].sort((a, b) => b.rating - a.rating || b.totalReviews - a.totalReviews);
  const rankByGrowth = byGrowth.findIndex((c) => c.id === you.id) + 1;
  const rankByRating = byRating.findIndex((c) => c.id === you.id) + 1;
  const leader = byGrowth[0].id === you.id ? null : byGrowth[0];
  const leaderExtra = leader ? leader.reviewsThisMonth - you.reviewsThisMonth : 0;

  const bullets: string[] = [];
  if (leader) bullets.push(`${leader.name} gained ${leaderExtra} more review${leaderExtra === 1 ? "" : "s"} than you this month (${leader.reviewsThisMonth} vs ${you.reviewsThisMonth}).`);
  if (rankByRating === 1) bullets.push(`You have the highest average rating (${you.rating.toFixed(1)}) among tracked businesses.`);
  const biggest = [...competitors].sort((a, b) => b.totalReviews - a.totalReviews)[0];
  if (biggest.totalReviews > you.totalReviews) {
    const gap = biggest.totalReviews - you.totalReviews;
    const monthsToClose = you.reviewsThisMonth > biggest.reviewsThisMonth ? Math.ceil(gap / (you.reviewsThisMonth - biggest.reviewsThisMonth)) : null;
    bullets.push(
      `${biggest.name} has the most total reviews (${biggest.totalReviews}). ${monthsToClose ? `At current pace you close that gap in about ${monthsToClose} months.` : "They are still adding reviews faster than you."}`,
    );
  }
  const falling = competitors.filter((c) => c.reviewsThisMonth < c.reviewsLastMonth);
  if (falling.length) bullets.push(`${falling.map((c) => c.name).join(", ")} ${falling.length === 1 ? "is" : "are"} slowing down — review volume dropped this month.`);

  return {
    rankByGrowth,
    rankByRating,
    total: all.length,
    leader,
    leaderExtra,
    headline: rankByGrowth === 1 ? "You are the fastest-growing business in your area" : `You rank #${rankByGrowth} of ${all.length} for review growth`,
    bullets,
  };
}
