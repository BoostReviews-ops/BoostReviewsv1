/**
 * Repository: reads a full Dataset for a location out of Supabase, and writes
 * the handful of mutations the app makes. The Dataset shape is the same one the
 * demo uses, so every screen and every analytics function works unchanged.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { DemoDataset } from "@/lib/demo/seed";
import { DEMO_ACTIONS } from "@/lib/demo/seed";
import type { Business, Competitor, DailyTaps, MonthlyReport, RecommendedAction, Review, ReviewCard, ScoreSnapshot, Subscription, TapEvent } from "@/lib/types";

export type Dataset = DemoDataset;

/* ------------------------------------------------------------------ */
/* Reads                                                               */
/* ------------------------------------------------------------------ */

/** The primary location for the signed-in user (first org → first business → primary location). */
export async function primaryLocationForUser(sb: SupabaseClient, userId: string) {
  const { data: m } = await sb.from("memberships").select("org_id").eq("user_id", userId).limit(1).maybeSingle();
  if (!m) return null;
  const { data: biz } = await sb.from("businesses").select("id, org_id, name, category, phone, website, timezone, created_at").eq("org_id", m.org_id).order("created_at").limit(1).maybeSingle();
  if (!biz) return null;
  const { data: loc } = await sb.from("locations").select("*").eq("business_id", biz.id).order("is_primary", { ascending: false }).limit(1).maybeSingle();
  if (!loc) return null;
  return { orgId: m.org_id as string, business: biz, location: loc };
}

export async function loadDataset(sb: SupabaseClient, locationId: string): Promise<Dataset> {
  const { data: loc } = await sb.from("locations").select("*").eq("id", locationId).single();
  const { data: biz } = await sb.from("businesses").select("*").eq("id", loc.business_id).single();
  const { data: org } = await sb.from("organizations").select("*").eq("id", biz.org_id).single();

  const since = new Date();
  since.setDate(since.getDate() - 400);
  const [reviewsQ, responsesQ, cardQ, compsQ, scoresQ, healthQ, actionsQ, reportsQ, subQ] = await Promise.all([
    sb.from("reviews").select("*").eq("location_id", locationId).gte("reviewed_at", since.toISOString()).order("reviewed_at", { ascending: false }),
    sb.from("review_responses").select("*").order("created_at", { ascending: false }),
    sb.from("review_cards").select("*").eq("location_id", locationId).order("created_at").limit(1).maybeSingle(),
    sb.from("competitors").select("*, competitor_snapshots(captured_on, rating, total_reviews)").eq("location_id", locationId),
    sb.from("reputation_score_snapshots").select("captured_on, score").eq("location_id", locationId).order("captured_on").limit(60),
    sb.from("profile_health_snapshots").select("captured_on, score").eq("location_id", locationId).order("captured_on").limit(60),
    sb.from("recommended_actions").select("*").eq("location_id", locationId).order("created_at", { ascending: false }),
    sb.from("monthly_reports").select("*").eq("location_id", locationId).order("period_start", { ascending: false }).limit(12),
    sb.from("subscriptions").select("*").eq("org_id", biz.org_id).maybeSingle(),
  ]);

  const responsesByReview = new Map<string, { text: string; status: string; ai_assisted: boolean; published_at: string | null; approved_at: string | null; created_at: string }>();
  for (const r of responsesQ.data ?? []) if (!responsesByReview.has(r.review_id)) responsesByReview.set(r.review_id, r);

  const reviews: Review[] = (reviewsQ.data ?? []).map((r) => {
    const resp = responsesByReview.get(r.id);
    return {
      id: r.id,
      locationId,
      reviewerName: r.reviewer_name,
      reviewerInitials: initials(r.reviewer_name),
      rating: r.rating,
      text: r.text ?? "",
      date: r.reviewed_at,
      sentiment: r.sentiment ?? (r.rating >= 4 ? "positive" : r.rating === 3 ? "neutral" : "negative"),
      themes: r.themes ?? [],
      response: resp
        ? { text: resp.text, date: resp.published_at ?? resp.approved_at ?? resp.created_at, status: resp.status === "published" ? "responded" : (resp.status as Review["response"] extends infer T ? T extends { status: infer S } ? S : never : never), aiAssisted: resp.ai_assisted }
        : null,
      source: "google",
    };
  });

  const card = cardQ.data;
  let dailyTaps: DailyTaps[] = [];
  let tapEvents: TapEvent[] = [];
  if (card) {
    const from = new Date();
    from.setDate(from.getDate() - 180);
    const { data: taps } = await sb.from("tap_events").select("tapped_at, source, device").eq("card_id", card.id).gte("tapped_at", from.toISOString()).order("tapped_at", { ascending: false });
    const byDay = new Map<string, number>();
    for (let i = 0; i < 180; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      byDay.set(d.toISOString().slice(0, 10), 0);
    }
    for (const t of taps ?? []) {
      const k = t.tapped_at.slice(0, 10);
      byDay.set(k, (byDay.get(k) ?? 0) + 1);
    }
    dailyTaps = [...byDay.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([date, n]) => ({ date, taps: n }));
    tapEvents = (taps ?? []).slice(0, 40).map((t, i) => ({ id: `tap_${i}`, cardId: card.id, timestamp: t.tapped_at, device: (t.device ?? "Other") as TapEvent["device"], source: t.source }));
  }

  const competitors: Competitor[] = (compsQ.data ?? []).map((c) => {
    const snaps = [...(c.competitor_snapshots ?? [])].sort((a, b) => (a.captured_on < b.captured_on ? -1 : 1));
    const latest = snaps[snaps.length - 1];
    const monthly: number[] = [];
    for (let m = 5; m >= 0; m--) {
      const end = snapAtDaysAgo(snaps, m * 30);
      const start = snapAtDaysAgo(snaps, (m + 1) * 30);
      monthly.push(end && start ? Math.max(0, end.total_reviews - start.total_reviews) : 0);
    }
    return {
      id: c.id,
      name: c.name,
      category: c.category ?? "",
      distanceMiles: Number(c.distance_miles ?? 0),
      rating: Number(latest?.rating ?? 0),
      totalReviews: latest?.total_reviews ?? 0,
      reviewsThisMonth: monthly[5],
      reviewsLastMonth: monthly[4],
      monthlyHistory: monthly,
    };
  });

  const scoreHistory: ScoreSnapshot[] = (scoresQ.data ?? []).map((s) => ({ date: s.captured_on, score: s.score }));
  const healthHistory: ScoreSnapshot[] = (healthQ.data ?? []).map((s) => ({ date: s.captured_on, score: s.score }));
  const actionsRows = actionsQ.data ?? [];
  const toAction = (a: (typeof actionsRows)[number]): RecommendedAction => ({
    id: a.id, title: a.title, why: a.why, impact: a.impact, effort: (a.effort ?? "15 min") as RecommendedAction["effort"], href: a.href ?? "/app", cta: "Open", category: (a.category ?? "reviews") as RecommendedAction["category"], completedAt: a.completed_at,
  });
  const openActions = actionsRows.filter((a) => a.status === "open").map(toAction);
  const doneActions = actionsRows.filter((a) => a.status === "completed").map(toAction);

  const reports: MonthlyReport[] = (reportsQ.data ?? []).map((r) => r.payload as MonthlyReport);
  const sub = subQ.data;
  const subscription: Subscription = sub
    ? { plan: sub.plan, status: sub.status, currentPeriodEnd: (sub.current_period_end ?? "").slice(0, 10), paymentMethod: sub.payment_method_last4 ? { brand: sub.payment_method_brand ?? "Card", last4: sub.payment_method_last4, expMonth: 0, expYear: 0 } : null, priceMonthly: { starter: 149, growth: 199, premium: 299 }[sub.plan as "starter" | "growth" | "premium"] ?? 199 }
    : { plan: "growth", status: "trialing", currentPeriodEnd: "", paymentMethod: null, priceMonthly: 199 };

  const business: Business = {
    id: biz.id, orgId: biz.org_id, name: biz.name, category: biz.category ?? "", address: loc.address ?? "", city: loc.city ?? "", phone: biz.phone ?? "", website: biz.website ?? "", googlePlaceId: loc.google_place_id, timezone: biz.timezone, customerSince: biz.created_at.slice(0, 10),
    locations: [{ id: loc.id, businessId: biz.id, name: loc.name, address: loc.address ?? "", isPrimary: !!loc.is_primary }],
  };
  const reviewCard: ReviewCard = card
    ? { id: card.id, locationId, slug: card.slug, label: card.label, status: card.status, destinationType: card.destination_type, destinationUrl: card.destination_url, installedAt: card.installed_at ?? card.created_at.slice(0, 10) }
    : { id: "", locationId, slug: "", label: "No review card yet", status: "paused", destinationType: "google_review", destinationUrl: "", installedAt: "" };

  return {
    org: { id: org.id, name: org.name, type: org.type },
    business,
    googleRating: Number(loc.google_rating ?? 0),
    totalReviews: loc.google_review_count ?? reviews.length,
    reviews,
    dailyTaps,
    tapEvents,
    reviewCard,
    competitors,
    scoreHistory,
    healthHistory,
    actions: openActions.length ? openActions : DEMO_ACTIONS.map((a) => ({ ...a })),
    completedActions: doneActions,
    historicalReports: reports,
    subscription,
    photosLastUpdatedDaysAgo: loc.photos_last_updated_at ? daysSince(loc.photos_last_updated_at) : 90,
    lastPostDaysAgo: loc.last_post_at ? daysSince(loc.last_post_at) : 90,
  };
}

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}
function daysSince(iso: string) {
  return Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 86400000));
}
function snapAtDaysAgo(snaps: { captured_on: string; total_reviews: number; rating: number }[], daysAgo: number) {
  const target = new Date();
  target.setDate(target.getDate() - daysAgo);
  const key = target.toISOString().slice(0, 10);
  let best = null;
  for (const s of snaps) if (s.captured_on <= key) best = s;
  return best;
}

/* ------------------------------------------------------------------ */
/* Writes                                                              */
/* ------------------------------------------------------------------ */

export async function saveReply(sb: SupabaseClient, reviewId: string, text: string, status: "draft" | "approved" | "published", aiAssisted: boolean, userId?: string) {
  const row = {
    review_id: reviewId, text, status, ai_assisted: aiAssisted,
    approved_by: status !== "draft" ? userId ?? null : null,
    approved_at: status !== "draft" ? new Date().toISOString() : null,
    published_at: status === "published" ? new Date().toISOString() : null,
  };
  const { data, error } = await sb.from("review_responses").insert(row).select("id").single();
  if (error) throw error;
  return data.id as string;
}

export async function markPublished(sb: SupabaseClient, responseId: string) {
  await sb.from("review_responses").update({ status: "published", published_at: new Date().toISOString() }).eq("id", responseId);
}

export async function updateCard(sb: SupabaseClient, cardId: string, patch: { destination_type?: "google_review" | "custom"; destination_url?: string; status?: "active" | "paused" }) {
  const { error } = await sb.from("review_cards").update(patch).eq("id", cardId);
  if (error) throw error;
}

export async function completeAction(sb: SupabaseClient, actionId: string, done: boolean) {
  const { error } = await sb.from("recommended_actions").update({ status: done ? "completed" : "open", completed_at: done ? new Date().toISOString() : null }).eq("id", actionId);
  if (error) throw error;
}

export async function insertWebsiteLead(sb: SupabaseClient, lead: { business_id?: string | null; contact_name: string; email: string; phone?: string; website_url?: string; notes?: string }) {
  const { data, error } = await sb.from("website_leads").insert(lead).select("id").single();
  if (error) throw error;
  return data.id as string;
}

export async function resolveCardBySlug(sb: SupabaseClient, slug: string) {
  const { data } = await sb.from("review_cards").select("id, status, destination_url").eq("slug", slug).maybeSingle();
  return data;
}

export async function recordTap(sb: SupabaseClient, cardId: string, source: "nfc" | "qr" | "link", userAgent: string | null) {
  const device = /iPhone|iPad/.test(userAgent ?? "") ? "iPhone" : /Android/.test(userAgent ?? "") ? "Android" : "Other";
  await sb.from("tap_events").insert({ card_id: cardId, source, device, user_agent: userAgent?.slice(0, 300) ?? null });
}

/** Create org → business → location → review card for a brand-new customer. */
export async function createBusiness(sb: SupabaseClient, userId: string, input: { businessName: string; phone?: string; website?: string; address?: string; city?: string; destinationUrl?: string }) {
  const { data: org, error: e1 } = await sb.from("organizations").insert({ name: input.businessName }).select("id").single();
  if (e1) throw e1;
  const { error: e2 } = await sb.from("memberships").insert({ org_id: org.id, user_id: userId, role: "owner" });
  if (e2) throw e2;
  const { data: biz, error: e3 } = await sb.from("businesses").insert({ org_id: org.id, name: input.businessName, phone: input.phone ?? null, website: input.website ?? null }).select("id").single();
  if (e3) throw e3;
  const { data: loc, error: e4 } = await sb.from("locations").insert({ business_id: biz.id, name: "Main", address: input.address ?? null, city: input.city ?? null, is_primary: true }).select("id").single();
  if (e4) throw e4;
  const slug = slugify(input.businessName) + "-" + Math.random().toString(36).slice(2, 6);
  const { error: e5 } = await sb.from("review_cards").insert({ location_id: loc.id, slug, destination_type: "google_review", destination_url: input.destinationUrl ?? input.website ?? "https://www.google.com/maps", installed_at: new Date().toISOString().slice(0, 10) });
  if (e5) throw e5;
  return { orgId: org.id as string, businessId: biz.id as string, locationId: loc.id as string, slug };
}

export function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "card";
}

/* ------------------------------------------------------------------ */
/* Google connection + sync                                            */
/* ------------------------------------------------------------------ */

export async function saveGoogleConnection(sb: SupabaseClient, businessId: string, tokens: { access_token: string; refresh_token?: string; expires_in: number }, email: string | null) {
  const existing = await sb.from("google_connections").select("refresh_token").eq("business_id", businessId).maybeSingle();
  const row = {
    business_id: businessId,
    google_account_email: email,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token ?? existing.data?.refresh_token ?? "",
    expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    scopes: ["https://www.googleapis.com/auth/business.manage"],
    status: "active",
  };
  const { error } = await sb.from("google_connections").upsert(row, { onConflict: "business_id" });
  if (error) throw error;
}

/** Token store adapter for GoogleBusinessProvider. */
export function tokenStore(sb: SupabaseClient) {
  return {
    async getTokens(businessId: string) {
      const { data } = await sb.from("google_connections").select("access_token, refresh_token, expires_at").eq("business_id", businessId).maybeSingle();
      if (!data) return null;
      const { data: loc } = await sb.from("locations").select("google_location_resource").eq("business_id", businessId).order("is_primary", { ascending: false }).limit(1).maybeSingle();
      return { accessToken: data.access_token, refreshToken: data.refresh_token, expiresAt: data.expires_at, locationResourceName: loc?.google_location_resource ?? "" };
    },
    async saveTokens(businessId: string, t: { accessToken: string; refreshToken: string; expiresAt: string }) {
      await sb.from("google_connections").update({ access_token: t.accessToken, refresh_token: t.refreshToken, expires_at: t.expiresAt }).eq("business_id", businessId);
    },
  };
}

export async function upsertReviews(sb: SupabaseClient, locationId: string, reviews: Review[]) {
  if (!reviews.length) return 0;
  const rows = reviews.map((r) => ({
    location_id: locationId, source: "google", external_id: r.id, reviewer_name: r.reviewerName, rating: r.rating, text: r.text, reviewed_at: r.date, sentiment: r.sentiment, themes: r.themes,
  }));
  const { error } = await sb.from("reviews").upsert(rows, { onConflict: "location_id,source,external_id", ignoreDuplicates: false });
  if (error) throw error;
  return rows.length;
}
