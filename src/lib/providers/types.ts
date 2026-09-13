/**
 * BusinessDataProvider — the seam between BoostReviews.AI and the outside world.
 *
 * DemoBusinessProvider  → seeded data, no credentials, used for the sales demo.
 * GoogleBusinessProvider → Google Business Profile APIs (OAuth), production.
 *
 * The UI and analytics only ever talk to this interface, so activating Google
 * later is a configuration change, not a rebuild.
 */
import type { Business, Competitor, DailyTaps, Review, ReviewCard, TapEvent } from "@/lib/types";

export type ProviderKind = "demo" | "google";

export interface ConnectionStatus {
  provider: ProviderKind;
  connected: boolean;
  accountEmail?: string;
  locationName?: string;
  lastSyncedAt?: string;
  /** Human-readable note, e.g. "Demo data — not connected to Google". */
  note: string;
}

export interface BusinessDataProvider {
  readonly kind: ProviderKind;
  getConnectionStatus(businessId: string): Promise<ConnectionStatus>;
  getBusiness(businessId: string): Promise<Business>;
  getProfileSummary(businessId: string): Promise<{ rating: number; totalReviews: number; photosLastUpdatedDaysAgo: number; lastPostDaysAgo: number }>;
  listReviews(locationId: string): Promise<Review[]>;
  /**
   * Publish a business reply to a review. In demo mode this only updates local
   * state. In production this calls the Google Business Profile API and MUST
   * only run after a human has approved the text.
   */
  publishReply(locationId: string, reviewId: string, text: string): Promise<{ ok: boolean; publishedAt: string }>;
  listCompetitors(businessId: string): Promise<Competitor[]>;
  getReviewCard(locationId: string): Promise<ReviewCard>;
  getDailyTaps(cardId: string): Promise<DailyTaps[]>;
  getRecentTaps(cardId: string): Promise<TapEvent[]>;
}
