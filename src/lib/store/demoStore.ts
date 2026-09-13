"use client";

/**
 * Demo state store. Holds only the *changes* a user makes during a demo
 * (saved replies, NFC destination, completed actions, website leads, taps
 * recorded from the QR redirect). Persisted to localStorage so the demo
 * survives refreshes; "Reset Demo" clears it.
 *
 * In production these writes go to Supabase via server actions instead.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DateRangeKey, ResponseStatus, TapEvent, WebsiteLead } from "@/lib/types";

export interface ReplyOverride {
  text: string;
  status: ResponseStatus; // draft | approved | responded
  updatedAt: string;
  aiAssisted: boolean;
}

export interface DemoState {
  version: number;
  hydrated: boolean;
  dateRange: DateRangeKey;
  replies: Record<string, ReplyOverride>;
  nfcDestinationType: "google_review" | "custom" | null;
  nfcDestinationUrl: string | null;
  nfcStatus: "active" | "paused" | null;
  completedActionIds: string[];
  dismissedActionIds: string[];
  websiteLeads: WebsiteLead[];
  extraTaps: TapEvent[];
  selectedPlan: "starter" | "growth" | "premium" | null;
  // actions
  setDateRange: (r: DateRangeKey) => void;
  saveReply: (reviewId: string, text: string, status: ResponseStatus, aiAssisted: boolean) => void;
  deleteReply: (reviewId: string) => void;
  setNfcDestination: (type: "google_review" | "custom", url: string) => void;
  setNfcStatus: (s: "active" | "paused") => void;
  completeAction: (id: string) => void;
  uncompleteAction: (id: string) => void;
  addWebsiteLead: (lead: Omit<WebsiteLead, "id" | "createdAt" | "status">) => WebsiteLead;
  recordTap: (cardId: string, source: TapEvent["source"]) => void;
  setPlan: (p: "starter" | "growth" | "premium") => void;
  resetDemo: () => void;
  setHydrated: () => void;
}

const initial = {
  version: 1,
  hydrated: false,
  dateRange: "30d" as DateRangeKey,
  replies: {},
  nfcDestinationType: null,
  nfcDestinationUrl: null,
  nfcStatus: null,
  completedActionIds: [],
  dismissedActionIds: [],
  websiteLeads: [],
  extraTaps: [],
  selectedPlan: null,
};

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      ...initial,
      setDateRange: (dateRange) => set({ dateRange }),
      saveReply: (reviewId, text, status, aiAssisted) =>
        set((s) => ({ replies: { ...s.replies, [reviewId]: { text, status, updatedAt: new Date().toISOString(), aiAssisted } } })),
      deleteReply: (reviewId) =>
        set((s) => {
          const next = { ...s.replies };
          delete next[reviewId];
          return { replies: next };
        }),
      setNfcDestination: (type, url) => set({ nfcDestinationType: type, nfcDestinationUrl: url }),
      setNfcStatus: (nfcStatus) => set({ nfcStatus }),
      completeAction: (id) => set((s) => ({ completedActionIds: Array.from(new Set([...s.completedActionIds, id])) })),
      uncompleteAction: (id) => set((s) => ({ completedActionIds: s.completedActionIds.filter((x) => x !== id) })),
      addWebsiteLead: (lead) => {
        const full: WebsiteLead = { ...lead, id: `lead_${Date.now()}`, createdAt: new Date().toISOString(), status: "new" };
        set((s) => ({ websiteLeads: [full, ...s.websiteLeads] }));
        return full;
      },
      recordTap: (cardId, source) => {
        const r = Math.random();
        const ev: TapEvent = {
          id: `tap_live_${Date.now()}`,
          cardId,
          timestamp: new Date().toISOString(),
          device: typeof navigator !== "undefined" && /iPhone|iPad/.test(navigator.userAgent) ? "iPhone" : r < 0.6 ? "Android" : "Other",
          source,
        };
        set((s) => ({ extraTaps: [ev, ...s.extraTaps].slice(0, 200) }));
        void get;
      },
      setPlan: (selectedPlan) => set({ selectedPlan }),
      resetDemo: () => set({ ...initial, hydrated: true }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "boostreviews-demo-v1",
      partialize: (s) => ({
        version: s.version,
        dateRange: s.dateRange,
        replies: s.replies,
        nfcDestinationType: s.nfcDestinationType,
        nfcDestinationUrl: s.nfcDestinationUrl,
        nfcStatus: s.nfcStatus,
        completedActionIds: s.completedActionIds,
        dismissedActionIds: s.dismissedActionIds,
        websiteLeads: s.websiteLeads,
        extraTaps: s.extraTaps,
        selectedPlan: s.selectedPlan,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
