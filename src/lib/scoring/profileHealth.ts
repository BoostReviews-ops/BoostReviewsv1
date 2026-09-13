/**
 * Google Profile Health (BoostReviews.AI proprietary assessment, 0–100).
 *
 * A checklist-style score that tells an owner how well-maintained their
 * Google Business Profile is. This is our assessment, not a Google metric.
 */
import type { ProfileHealthCheck } from "@/lib/types";

export interface ProfileHealthInputs {
  hoursComplete: boolean;
  phoneAndWebsite: boolean;
  servicesListed: boolean;
  descriptionPresent: boolean;
  categoriesSet: boolean;
  responseRate: number; // fraction, trailing 90d
  unansweredCount: number;
  avgMonthlyReviews90d: number;
  ratingTrend: number; // recent avg minus prior avg
  photosLastUpdatedDaysAgo: number;
  lastPostDaysAgo: number;
}

export function healthCategory(score: number) {
  if (score >= 90) return { label: "Excellent", tone: "excellent" as const };
  if (score >= 80) return { label: "Strong", tone: "strong" as const };
  if (score >= 70) return { label: "Good", tone: "good" as const };
  if (score >= 60) return { label: "Needs Attention", tone: "attention" as const };
  return { label: "At Risk", tone: "risk" as const };
}

export function computeProfileHealth(i: ProfileHealthInputs) {
  const checks: ProfileHealthCheck[] = [];

  const infoPoints = (i.hoursComplete ? 8 : 0) + (i.phoneAndWebsite ? 7 : 0);
  checks.push({
    key: "info",
    label: "Business information complete",
    status: infoPoints === 15 ? "pass" : infoPoints > 0 ? "warn" : "fail",
    detail: infoPoints === 15 ? "Hours, phone, website and address are all filled in." : "Some contact details or hours are missing.",
    points: infoPoints,
    maxPoints: 15,
  });

  checks.push({
    key: "services",
    label: "Services listed",
    status: i.servicesListed ? "pass" : "fail",
    detail: i.servicesListed ? "Your service menu is listed on Google." : "Add your services so customers can find you for them.",
    points: i.servicesListed ? 10 : 0,
    maxPoints: 10,
  });

  checks.push({
    key: "description",
    label: "Business description",
    status: i.descriptionPresent ? "pass" : "warn",
    detail: i.descriptionPresent ? "A clear description is present." : "Write a short description of what makes you different.",
    points: i.descriptionPresent ? 5 : 0,
    maxPoints: 5,
  });

  checks.push({
    key: "categories",
    label: "Categories set",
    status: i.categoriesSet ? "pass" : "warn",
    detail: i.categoriesSet ? "Primary and secondary categories are set." : "Choose the categories that match your services.",
    points: i.categoriesSet ? 5 : 0,
    maxPoints: 5,
  });

  const rrPoints = i.responseRate >= 0.9 ? 15 : i.responseRate >= 0.75 ? 11 : i.responseRate >= 0.5 ? 7 : 3;
  checks.push({
    key: "responseRate",
    label: "Review response rate",
    status: rrPoints === 15 ? "pass" : rrPoints >= 11 ? "warn" : "fail",
    detail: `${Math.round(i.responseRate * 100)}% of reviews from the last 90 days have a reply.`,
    points: rrPoints,
    maxPoints: 15,
    href: "/app/reviews?filter=unanswered",
  });

  const unPoints = i.unansweredCount === 0 ? 10 : i.unansweredCount <= 2 ? 9 : i.unansweredCount <= 5 ? 7 : i.unansweredCount <= 10 ? 4 : 1;
  checks.push({
    key: "unanswered",
    label: "Unanswered reviews",
    status: i.unansweredCount === 0 ? "pass" : i.unansweredCount <= 5 ? "warn" : "fail",
    detail: i.unansweredCount === 0 ? "Every recent review has a reply." : `${i.unansweredCount} review${i.unansweredCount === 1 ? "" : "s"} need${i.unansweredCount === 1 ? "s" : ""} a response.`,
    points: unPoints,
    maxPoints: 10,
    href: "/app/reviews?filter=unanswered",
  });

  const velPoints = i.avgMonthlyReviews90d >= 20 ? 15 : i.avgMonthlyReviews90d >= 10 ? 11 : i.avgMonthlyReviews90d >= 4 ? 7 : 3;
  checks.push({
    key: "velocity",
    label: "Review velocity",
    status: velPoints === 15 ? "pass" : velPoints >= 11 ? "warn" : "fail",
    detail: `About ${Math.round(i.avgMonthlyReviews90d)} new reviews a month keeps your profile active.`,
    points: velPoints,
    maxPoints: 15,
    href: "/app/review-card",
  });

  const trendPoints = i.ratingTrend >= -0.05 ? 10 : i.ratingTrend >= -0.2 ? 6 : 2;
  checks.push({
    key: "ratingTrend",
    label: "Rating trend",
    status: trendPoints === 10 ? "pass" : trendPoints === 6 ? "warn" : "fail",
    detail: i.ratingTrend >= 0.02 ? "Recent reviews are rating you higher than before." : i.ratingTrend >= -0.05 ? "Your rating is holding steady." : "Recent reviews are pulling your average down.",
    points: trendPoints,
    maxPoints: 10,
    href: "/app/insights",
  });

  const photoPoints = i.photosLastUpdatedDaysAgo <= 30 ? 10 : i.photosLastUpdatedDaysAgo <= 60 ? 4 : 1;
  checks.push({
    key: "photos",
    label: "Photo freshness",
    status: photoPoints === 10 ? "pass" : photoPoints === 4 ? "warn" : "fail",
    detail: photoPoints === 10 ? "Photos were updated recently." : `Last new photos were ${i.photosLastUpdatedDaysAgo} days ago. New photos recommended.`,
    points: photoPoints,
    maxPoints: 10,
  });

  const postPoints = i.lastPostDaysAgo <= 30 ? 5 : i.lastPostDaysAgo <= 60 ? 3 : 0;
  checks.push({
    key: "activity",
    label: "Recent profile activity",
    status: postPoints === 5 ? "pass" : postPoints === 3 ? "warn" : "fail",
    detail: postPoints === 5 ? `Last update was ${i.lastPostDaysAgo} days ago.` : "Post an update or offer to keep your profile active.",
    points: postPoints,
    maxPoints: 5,
  });

  const score = checks.reduce((a, c) => a + c.points, 0);
  return { score, category: healthCategory(score), checks };
}
