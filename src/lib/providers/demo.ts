import { getDemoDataset } from "@/lib/demo/seed";
import type { BusinessDataProvider, ConnectionStatus } from "./types";

/**
 * DemoBusinessProvider — serves the seeded Royal Massage & Spa dataset.
 * Zero network calls, zero credentials. Used for the sales demo.
 */
export class DemoBusinessProvider implements BusinessDataProvider {
  readonly kind = "demo" as const;

  async getConnectionStatus(): Promise<ConnectionStatus> {
    return {
      provider: "demo",
      connected: false,
      note: "Demo data — this account is not connected to Google. Seeded to look like several months of real history.",
      lastSyncedAt: new Date().toISOString(),
    };
  }

  async getBusiness() {
    return getDemoDataset().business;
  }

  async getProfileSummary() {
    const d = getDemoDataset();
    return {
      rating: d.googleRating,
      totalReviews: d.totalReviews,
      photosLastUpdatedDaysAgo: d.photosLastUpdatedDaysAgo,
      lastPostDaysAgo: d.lastPostDaysAgo,
    };
  }

  async listReviews() {
    return getDemoDataset().reviews;
  }

  async publishReply() {
    // Demo mode never publishes anywhere. Persistence is handled client-side
    // by the demo store so the sales demo can show a saved reply.
    return { ok: true, publishedAt: new Date().toISOString() };
  }

  async listCompetitors() {
    return getDemoDataset().competitors;
  }

  async getReviewCard() {
    return getDemoDataset().reviewCard;
  }

  async getDailyTaps() {
    return getDemoDataset().dailyTaps;
  }

  async getRecentTaps() {
    return getDemoDataset().tapEvents;
  }
}
