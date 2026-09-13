/**
 * GoogleBusinessProvider — production integration with Google Business Profile.
 *
 * STATUS: scaffolded, disabled by default. Activated by setting
 *   BUSINESS_DATA_PROVIDER=google
 * together with GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI.
 *
 * Endpoints used once enabled (all require OAuth 2.0 with the
 * https://www.googleapis.com/auth/business.manage scope and Google's
 * Business Profile API access approval):
 *   - My Business Account Management API  → accounts.list
 *   - My Business Business Information API → accounts.locations.list, locations.get
 *   - Google My Business API v4.9 (reviews) → accounts.locations.reviews.list
 *                                            accounts.locations.reviews.updateReply
 *
 * Nothing in this file runs in demo mode. Tokens must be stored server-side
 * (google_connections table, encrypted) and never sent to the browser.
 */
import type { Business, Competitor, DailyTaps, Review, ReviewCard, TapEvent } from "@/lib/types";
import type { BusinessDataProvider, ConnectionStatus } from "./types";

export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export const GOOGLE_SCOPES = ["https://www.googleapis.com/auth/business.manage", "openid", "email"];

export function getGoogleOAuthConfig(): GoogleOAuthConfig | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) return null;
  return { clientId, clientSecret, redirectUri };
}

export function buildGoogleAuthUrl(cfg: GoogleOAuthConfig, state: string) {
  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: cfg.redirectUri,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    scope: GOOGLE_SCOPES.join(" "),
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/** Token store contract — implemented against Supabase in production. */
export interface GoogleTokenStore {
  getTokens(businessId: string): Promise<{ accessToken: string; refreshToken: string; expiresAt: string; locationResourceName: string } | null>;
  saveTokens(businessId: string, tokens: { accessToken: string; refreshToken: string; expiresAt: string; locationResourceName: string }): Promise<void>;
}

export class GoogleBusinessProvider implements BusinessDataProvider {
  readonly kind = "google" as const;

  constructor(
    private readonly cfg: GoogleOAuthConfig,
    private readonly tokens: GoogleTokenStore,
  ) {}

  private async accessToken(businessId: string) {
    const t = await this.tokens.getTokens(businessId);
    if (!t) throw new Error("Google is not connected for this business.");
    if (new Date(t.expiresAt).getTime() > Date.now() + 60_000) return t;
    // Refresh
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: this.cfg.clientId,
        client_secret: this.cfg.clientSecret,
        refresh_token: t.refreshToken,
        grant_type: "refresh_token",
      }),
    });
    if (!res.ok) throw new Error("Failed to refresh Google token.");
    const json = (await res.json()) as { access_token: string; expires_in: number };
    const next = { ...t, accessToken: json.access_token, expiresAt: new Date(Date.now() + json.expires_in * 1000).toISOString() };
    await this.tokens.saveTokens(businessId, next);
    return next;
  }

  private async gbp<T>(businessId: string, url: string, init?: RequestInit): Promise<T> {
    const t = await this.accessToken(businessId);
    const res = await fetch(url, {
      ...init,
      headers: { ...(init?.headers ?? {}), Authorization: `Bearer ${t.accessToken}`, "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`Google API error ${res.status}: ${await res.text()}`);
    return (await res.json()) as T;
  }

  async getConnectionStatus(businessId: string): Promise<ConnectionStatus> {
    const t = await this.tokens.getTokens(businessId);
    return {
      provider: "google",
      connected: !!t,
      locationName: t?.locationResourceName,
      note: t ? "Connected to Google Business Profile." : "Google Business Profile is not connected yet.",
    };
  }

  async getBusiness(): Promise<Business> {
    throw new Error("GoogleBusinessProvider.getBusiness: load from database once Google is connected.");
  }

  async getProfileSummary(businessId: string) {
    const t = await this.accessToken(businessId);
    const loc = await this.gbp<{ metadata?: unknown }>(
      businessId,
      `https://mybusinessbusinessinformation.googleapis.com/v1/${t.locationResourceName}?readMask=name,title,metadata`,
    );
    void loc;
    // Rating/total come from the reviews list response (averageRating, totalReviewCount).
    const reviews = await this.gbp<{ averageRating?: number; totalReviewCount?: number }>(
      businessId,
      `https://mybusiness.googleapis.com/v4/${t.locationResourceName}/reviews?pageSize=1`,
    );
    return {
      rating: reviews.averageRating ?? 0,
      totalReviews: reviews.totalReviewCount ?? 0,
      photosLastUpdatedDaysAgo: 0,
      lastPostDaysAgo: 0,
    };
  }

  async listReviews(locationId: string): Promise<Review[]> {
    const t = await this.accessToken(locationId);
    type GReview = {
      reviewId: string;
      reviewer: { displayName: string };
      starRating: "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE";
      comment?: string;
      createTime: string;
      reviewReply?: { comment: string; updateTime: string };
    };
    const stars = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 } as const;
    const out: Review[] = [];
    let pageToken = "";
    do {
      const page = await this.gbp<{ reviews?: GReview[]; nextPageToken?: string }>(
        locationId,
        `https://mybusiness.googleapis.com/v4/${t.locationResourceName}/reviews?pageSize=50${pageToken ? `&pageToken=${pageToken}` : ""}`,
      );
      for (const r of page.reviews ?? []) {
        const rating = stars[r.starRating];
        out.push({
          id: r.reviewId,
          locationId,
          reviewerName: r.reviewer.displayName,
          reviewerInitials: r.reviewer.displayName
            .split(" ")
            .map((p) => p[0])
            .join("")
            .slice(0, 2),
          rating,
          text: r.comment ?? "",
          date: r.createTime,
          // Sentiment/themes are produced by the AI service in a sync job.
          sentiment: rating >= 4 ? "positive" : rating === 3 ? "neutral" : "negative",
          themes: [],
          response: r.reviewReply ? { text: r.reviewReply.comment, date: r.reviewReply.updateTime, status: "responded", aiAssisted: false } : null,
          source: "google",
        });
      }
      pageToken = page.nextPageToken ?? "";
    } while (pageToken);
    return out;
  }

  async publishReply(locationId: string, reviewId: string, text: string) {
    const t = await this.accessToken(locationId);
    await this.gbp(locationId, `https://mybusiness.googleapis.com/v4/${t.locationResourceName}/reviews/${reviewId}/reply`, {
      method: "PUT",
      body: JSON.stringify({ comment: text }),
    });
    return { ok: true, publishedAt: new Date().toISOString() };
  }

  async listCompetitors(): Promise<Competitor[]> {
    // Competitor data comes from the Places API (public rating/review counts),
    // stored in the competitors table by a scheduled job.
    return [];
  }

  async getReviewCard(): Promise<ReviewCard> {
    throw new Error("Review cards are stored in the database (review_cards table), not fetched from Google.");
  }

  async getDailyTaps(): Promise<DailyTaps[]> {
    return [];
  }

  async getRecentTaps(): Promise<TapEvent[]> {
    return [];
  }
}
