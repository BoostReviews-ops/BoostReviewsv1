"use client";

/**
 * The single view-model hook for the application. Combines the active
 * dataset (demo provider today) with the user's demo edits, then derives every
 * number the UI shows so all screens stay mathematically consistent.
 */
import { useMemo } from "react";
import {
  avgRating,
  avgResponseHours,
  competitorInsights,
  isAnswered,
  monthlyReviewSeries,
  periodMetrics,
  responseRate,
  reviewsInWindow,
  tapsInWindow,
  themeStats,
  weeklySeries,
  tapsByWeekday,
  sentimentBreakdown,
  ratingDistribution,
} from "@/lib/demo/analytics";
import { getDemoDataset, demoToday, ymd } from "@/lib/demo/seed";
import { computeProfileHealth } from "@/lib/scoring/profileHealth";
import { computeReputationScore, type ReputationInputs } from "@/lib/scoring/reputation";
import { useDemoStore } from "@/lib/store/demoStore";
import type { Competitor, DailyTaps, MonthlyReport, RecommendedAction, Review, ReviewCard, TapEvent } from "@/lib/types";
import { formatPct } from "@/lib/utils";

export interface Insight {
  title: string;
  detail: string;
  href?: string;
  tone: "positive" | "warning" | "neutral";
  metric?: string;
}

export function useBusinessData() {
  const replies = useDemoStore((s) => s.replies);
  const dateRange = useDemoStore((s) => s.dateRange);
  const nfcDestinationType = useDemoStore((s) => s.nfcDestinationType);
  const nfcDestinationUrl = useDemoStore((s) => s.nfcDestinationUrl);
  const nfcStatus = useDemoStore((s) => s.nfcStatus);
  const completedActionIds = useDemoStore((s) => s.completedActionIds);
  const extraTaps = useDemoStore((s) => s.extraTaps);
  const websiteLeads = useDemoStore((s) => s.websiteLeads);
  const selectedPlan = useDemoStore((s) => s.selectedPlan);

  return useMemo(() => {
    const d = getDemoDataset();

    /* ---------- reviews with demo edits applied ---------- */
    const reviews: Review[] = d.reviews.map((r) => {
      const o = replies[r.id];
      if (!o) return r;
      return { ...r, response: { text: o.text, date: o.updatedAt, status: o.status, aiAssisted: o.aiAssisted } };
    });

    /* ---------- taps with live QR/NFC taps merged ---------- */
    const todayKey = ymd(demoToday());
    const dailyTaps: DailyTaps[] = d.dailyTaps.map((x) => ({ ...x }));
    const liveToday = extraTaps.filter((t) => t.timestamp.slice(0, 10) === todayKey).length;
    const todayRow = dailyTaps.find((x) => x.date === todayKey);
    if (todayRow) todayRow.taps += liveToday;
    else dailyTaps.push({ date: todayKey, taps: liveToday });
    const tapEvents: TapEvent[] = [...extraTaps, ...d.tapEvents].slice(0, 40);

    /* ---------- period metrics ---------- */
    const metrics = periodMetrics(reviews, dailyTaps, dateRange);
    const m30 = periodMetrics(reviews, dailyTaps, "30d");
    const last90 = reviewsInWindow(reviews, 90, 0);
    const prev90 = reviewsInWindow(reviews, 180, 90);
    const last30 = reviewsInWindow(reviews, 30, 0);
    const prev30 = reviewsInWindow(reviews, 60, 30);
    const unanswered = last90.filter((r) => !isAnswered(r));
    const unansweredRecent = last30.filter((r) => !isAnswered(r));

    /* ---------- competitors ---------- */
    const monthly = monthlyReviewSeries(reviews, 6);
    const you: Competitor = {
      id: d.business.id,
      name: d.business.name,
      category: d.business.category,
      distanceMiles: 0,
      rating: d.googleRating,
      totalReviews: d.totalReviews,
      reviewsThisMonth: last30.length,
      reviewsLastMonth: prev30.length,
      monthlyHistory: monthly.map((m) => m.count),
      isYou: true,
    };
    const compInsight = competitorInsights(you, d.competitors);
    const prevYou = { ...you, reviewsThisMonth: prev30.length };
    const prevComps = d.competitors.map((c) => ({ ...c, reviewsThisMonth: c.reviewsLastMonth }));
    const prevCompInsight = competitorInsights(prevYou, prevComps);

    /* ---------- profile health ---------- */
    const health = computeProfileHealth({
      hoursComplete: true,
      phoneAndWebsite: true,
      servicesListed: true,
      descriptionPresent: true,
      categoriesSet: true,
      responseRate: responseRate(last90),
      unansweredCount: unanswered.length,
      avgMonthlyReviews90d: last90.length / 3,
      ratingTrend: avgRating(last90) - avgRating(prev90),
      photosLastUpdatedDaysAgo: d.photosLastUpdatedDaysAgo,
      lastPostDaysAgo: d.lastPostDaysAgo,
    });
    const healthPrev = d.healthHistory[d.healthHistory.length - 5]?.score ?? health.score;

    /* ---------- reputation score ---------- */
    const prior3Avg = reviewsInWindow(reviews, 120, 30).length / 3;
    const prevPrior3Avg = reviewsInWindow(reviews, 150, 60).length / 3;
    const currentInputs: ReputationInputs = {
      googleRating: d.googleRating,
      avgMonthlyReviews90d: last90.length / 3,
      reviewGrowth: prior3Avg > 0 ? last30.length / prior3Avg - 1 : 0,
      responseRate: responseRate(last90),
      avgResponseHours: avgResponseHours(last90),
      avgRecentRating: avgRating(last90),
      profileHealth: health.score,
      nfcTaps30d: tapsInWindow(dailyTaps, 30, 0),
      competitorGrowthRank: compInsight.rankByGrowth,
      ratingRank: compInsight.rankByRating,
      trackedCount: compInsight.total,
      topCompetitorName: compInsight.leader?.name,
      topCompetitorExtraReviews: compInsight.leaderExtra,
    };
    const prev90Window = reviewsInWindow(reviews, 120, 30);
    const previousInputs: ReputationInputs = {
      googleRating: d.googleRating,
      avgMonthlyReviews90d: prev90Window.length / 3,
      reviewGrowth: prevPrior3Avg > 0 ? prev30.length / prevPrior3Avg - 1 : 0,
      responseRate: responseRate(prev90Window),
      avgResponseHours: avgResponseHours(prev90Window),
      avgRecentRating: avgRating(prev90Window),
      profileHealth: healthPrev,
      nfcTaps30d: tapsInWindow(dailyTaps, 60, 30),
      competitorGrowthRank: prevCompInsight.rankByGrowth,
      ratingRank: prevCompInsight.rankByRating,
      trackedCount: prevCompInsight.total,
    };
    const score = computeReputationScore(currentInputs, previousInputs);
    const scoreHistory = [...d.scoreHistory.slice(0, -1), { date: todayKey, score: score.score }];

    /* ---------- themes & sentiment ---------- */
    const themes = themeStats(reviews, 90);
    const positiveThemes = themes.filter((t) => t.polarity === "positive");
    const negativeThemes = themes.filter((t) => t.polarity === "negative");
    const sentiment90 = sentimentBreakdown(last90);
    const sentimentPrev90 = sentimentBreakdown(prev90);
    const distribution = ratingDistribution(last90);

    /* ---------- review card ---------- */
    const reviewCard: ReviewCard = {
      ...d.reviewCard,
      destinationType: nfcDestinationType ?? d.reviewCard.destinationType,
      destinationUrl: nfcDestinationUrl ?? d.reviewCard.destinationUrl,
      status: nfcStatus ?? d.reviewCard.status,
    };
    const taps7 = tapsInWindow(dailyTaps, 7, 0);
    const taps7Prev = tapsInWindow(dailyTaps, 14, 7);
    const tapsTotal = dailyTaps.reduce((a, x) => a + x.taps, 0);
    const weekly = weeklySeries(reviews, dailyTaps, 12);
    const weekday = tapsByWeekday(dailyTaps, 30);
    const peakDay = [...weekday].sort((a, b) => b.avg - a.avg)[0];
    const tapToReview = m30.nfcTaps > 0 ? m30.reviewsGained / m30.nfcTaps : 0;

    /* ---------- actions ---------- */
    const actions: RecommendedAction[] = d.actions
      .map((a) => {
        if (a.id === "act_respond_unanswered") {
          const n = unanswered.length;
          return {
            ...a,
            title: n === 0 ? "All reviews answered — keep it up" : `Respond to ${n} unanswered review${n === 1 ? "" : "s"}`,
            why: n === 0 ? "Every review from the last 90 days has a reply. Keep responding within 24 hours to hold your Reputation Score." : a.why.replace("Three of these", `${unansweredRecent.length === 1 ? "One" : unansweredRecent.length === 2 ? "Two" : unansweredRecent.length === 3 ? "Three" : String(unansweredRecent.length)} of these`),
            completedAt: n === 0 ? new Date().toISOString() : null,
          };
        }
        if (a.id === "act_review_requests" && compInsight.leader) {
          return { ...a, why: `${compInsight.leader.name} gained ${compInsight.leaderExtra} more reviews than you this month. Moving the review stand to checkout and asking at the end of each visit typically adds 6–10 reviews a month.` };
        }
        return a;
      })
      .map((a) => ({ ...a, completedAt: a.completedAt ?? (completedActionIds.includes(a.id) ? new Date().toISOString() : null) }));
    const openActions = actions.filter((a) => !a.completedAt);
    const completedActions = [...actions.filter((a) => a.completedAt), ...d.completedActions].sort(
      (a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime(),
    );

    /* ---------- storytelling: what's working / needs attention ---------- */
    const staff = positiveThemes.find((t) => t.key === "staff");
    const topPositive = positiveThemes[0];
    const rising = [...negativeThemes].filter((t) => t.change > 0.1 && t.count >= 3).sort((a, b) => b.count - a.count || b.change - a.change)[0];

    const whatsWorking: Insight[] = [];
    if (m30.reviewGrowth > 0.05)
      whatsWorking.push({
        title: "Review growth is accelerating",
        detail: `${d.business.name} received ${last30.length} reviews in the last 30 days compared with ${prev30.length} the month before.`,
        metric: formatPct(m30.reviewGrowth, { sign: true }),
        tone: "positive",
        href: "/app/reviews",
      });
    if (currentInputs.responseRate >= 0.9)
      whatsWorking.push({
        title: "You're answering customers",
        detail: `${Math.round(currentInputs.responseRate * 100)}% of reviews from the last 90 days have a reply, up from ${Math.round(previousInputs.responseRate * 100)}%.`,
        metric: `${Math.round(currentInputs.responseRate * 100)}%`,
        tone: "positive",
        href: "/app/reviews",
      });
    if (topPositive)
      whatsWorking.push({
        title: `Customers love your ${topPositive.label.toLowerCase()}`,
        detail: `${topPositive.label} came up positively in ${Math.round(topPositive.share * 100)}% of recent reviews${staff && staff.key !== topPositive.key ? `, and staff friendliness in ${Math.round(staff.share * 100)}%` : ""}.`,
        metric: `${Math.round(topPositive.share * 100)}%`,
        tone: "positive",
        href: "/app/insights",
      });
    if (m30.nfcChange > 0.05)
      whatsWorking.push({
        title: "The review card is working",
        detail: `${m30.nfcTaps} taps this month, ${formatPct(m30.nfcChange, { sign: true })} versus last month. About 1 in ${Math.round(1 / Math.max(tapToReview, 0.01))} taps becomes a review.`,
        metric: formatPct(m30.nfcChange, { sign: true }),
        tone: "positive",
        href: "/app/review-card",
      });

    const needsAttention: Insight[] = [];
    if (unanswered.length > 0)
      needsAttention.push({
        title: `${unanswered.length} review${unanswered.length === 1 ? "" : "s"} still need${unanswered.length === 1 ? "s" : ""} a response`,
        detail: unansweredRecent.length ? `${unansweredRecent.length} arrived in the last 30 days, including a ${Math.min(...unansweredRecent.map((r) => r.rating))}-star review.` : "Older reviews without a reply still show on your profile.",
        tone: "warning",
        href: "/app/reviews?filter=unanswered",
      });
    if (rising)
      needsAttention.push({
        title: `${rising.label} complaints increased`,
        detail: `Negative mentions of ${rising.label.toLowerCase()} rose ${formatPct(rising.change)} over the last 90 days (${rising.count} mentions).`,
        tone: "warning",
        href: "/app/insights",
      });
    health.checks
      .filter((c) => c.status !== "pass" && c.key !== "unanswered" && c.key !== "responseRate")
      .forEach((c) =>
        needsAttention.push({
          title: c.key === "photos" ? "New Google photos are recommended" : c.label,
          detail: c.detail,
          tone: "warning",
          href: "/app/google-profile",
        }),
      );
    if (compInsight.leader)
      needsAttention.push({
        title: `${compInsight.leader.name} is gaining reviews faster`,
        detail: `They added ${compInsight.leader.reviewsThisMonth} reviews this month versus your ${last30.length}.`,
        tone: "neutral",
        href: "/app/competitors",
      });

    /* ---------- current monthly report ---------- */
    const start = new Date(demoToday());
    start.setDate(start.getDate() - 29);
    const currentReport: MonthlyReport = {
      id: "report_current",
      periodLabel: `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${demoToday().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
      periodStart: ymd(start),
      periodEnd: todayKey,
      reputationScore: score.score,
      scoreChange: score.change,
      googleRating: d.googleRating,
      reviewsGained: last30.length,
      reviewGrowth: m30.reviewGrowth,
      responseRate: currentInputs.responseRate,
      nfcTaps: m30.nfcTaps,
      nfcChange: m30.nfcChange,
      topPositiveThemes: positiveThemes.slice(0, 3).map((t) => t.label),
      emergingNegativeThemes: negativeThemes.filter((t) => t.change > 0).slice(0, 2).map((t) => t.label),
      competitorSummary: `${compInsight.headline}. ${compInsight.bullets[0] ?? ""}`,
      actionsCompleted: completedActions.slice(0, 4).map((a) => a.title),
      recommendedNextSteps: openActions.map((a) => a.title),
      executiveSummary: `${d.business.name}'s reputation is ${score.category.label.toLowerCase()} at ${score.score}/100, up ${score.change} points. Review volume grew ${formatPct(m30.reviewGrowth)} to ${last30.length} new reviews with a ${d.googleRating.toFixed(1)} rating, and ${Math.round(currentInputs.responseRate * 100)}% of recent reviews have a reply. ${rising ? `The one issue to watch is ${rising.label.toLowerCase()}, which customers mentioned more often this period.` : "No emerging complaints stood out this period."}`,
    };

    return {
      business: d.business,
      org: d.org,
      googleRating: d.googleRating,
      totalReviews: d.totalReviews,
      reviews,
      metrics,
      m30,
      last30,
      prev30,
      last90,
      unanswered,
      unansweredRecent,
      score,
      scoreHistory,
      health,
      healthHistory: d.healthHistory,
      themes,
      positiveThemes,
      negativeThemes,
      sentiment90,
      sentimentPrev90,
      distribution,
      you,
      competitors: d.competitors,
      compInsight,
      reviewCard,
      dailyTaps,
      tapEvents,
      taps7,
      taps7Prev,
      tapsTotal,
      weekly,
      weekday,
      peakDay,
      tapToReview,
      monthly,
      actions,
      openActions,
      completedActions,
      whatsWorking,
      needsAttention,
      reports: [currentReport, ...d.historicalReports],
      subscription: { ...d.subscription, plan: selectedPlan ?? d.subscription.plan },
      websiteLeads,
      dateRange,
    };
  }, [replies, dateRange, nfcDestinationType, nfcDestinationUrl, nfcStatus, completedActionIds, extraTaps, websiteLeads, selectedPlan]);
}

export type BusinessData = ReturnType<typeof useBusinessData>;
