"use client";

/**
 * Client state store.
 *
 * Demo mode: holds the edits a prospect makes during a demo (saved replies, NFC
 * destination, completed actions, website leads, taps recorded from the QR
 * redirect). Persisted to localStorage; "Reset Demo" clears it.
 *
 * Live mode: `liveDataset` holds the signed-in business's data fetched from
 * /api/me/dataset, and every mutation is also sent to the API. The same
 * optimistic overrides are applied so the UI updates instantly.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DemoDataset } from "@/lib/demo/seed";
import type { DateRangeKey, ResponseStatus, TapEvent, WebsiteLead } from "@/lib/types";

export interface ReplyOverride {
  text: string;
  status: ResponseStatus; // draft | approved | responded
  updatedAt: string;
  aiAssisted: boolean;
}

export type AppMode = "demo" | "live";

export interface DemoState {
  version: number;
  hydrated: boolean;
  mode: AppMode;
  liveDataset: DemoDataset | null;
  liveError: string | null;
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
  setMode: (m: AppMode) => void;
  setLiveDataset: (d: DemoDataset | null, error?: string | null) => void;
  refreshLive: () => Promise<void>;
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
  version: 2,
  hydrated: false,
  mode: "demo" as AppMode,
  liveDataset: null as DemoDataset | null,
  liveError: null as string | null,
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

/** Fire-and-forget API call in live mode; errors surface via liveError. */
async function live(get: () => DemoState, set: (p: Partial<DemoState>) => void, path: string, init: RequestInit) {
  if (get().mode !== "live") return;
  try {
    const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...init });
    if (!res.ok) throw new Error((await res.json().catch(() => ({ error: res.statusText }))).error ?? res.statusText);
    await get().refreshLive();
  } catch (e) {
    set({ liveError: (e as Error).message });
  }
}

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      ...initial,
      setMode: (mode) => set({ mode }),
      setLiveDataset: (liveDataset, error = null) => set({ liveDataset, liveError: error }),
      refreshLive: async () => {
        try {
          const res = await fetch("/api/me/dataset", { cache: "no-store" });
          const json = (await res.json()) as { mode: string; dataset?: DemoDataset; error?: string };
          if (json.mode === "live" && json.dataset) set({ liveDataset: json.dataset, liveError: null, replies: {}, nfcDestinationType: null, nfcDestinationUrl: null, nfcStatus: null, completedActionIds: [] });
          else if (json.error) set({ liveError: json.error });
        } catch (e) {
          set({ liveError: (e as Error).message });
        }
      },
      setDateRange: (dateRange) => set({ dateRange }),
      saveReply: (reviewId, text, status, aiAssisted) => {
        set((s) => ({ replies: { ...s.replies, [reviewId]: { text, status, updatedAt: new Date().toISOString(), aiAssisted } } }));
        void live(get, set, `/api/reviews/${reviewId}/reply`, { method: "POST", body: JSON.stringify({ text, status: status === "draft" ? "draft" : "approved", aiAssisted }) });
      },
      deleteReply: (reviewId) =>
        set((s) => {
          const next = { ...s.replies };
          delete next[reviewId];
          return { replies: next };
        }),
      setNfcDestination: (type, url) => {
        set({ nfcDestinationType: type, nfcDestinationUrl: url });
        const cardId = get().liveDataset?.reviewCard.id;
        if (cardId) void live(get, set, "/api/card", { method: "PATCH", body: JSON.stringify({ cardId, destinationType: type, destinationUrl: url }) });
      },
      setNfcStatus: (nfcStatus) => {
        set({ nfcStatus });
        const cardId = get().liveDataset?.reviewCard.id;
        if (cardId) void live(get, set, "/api/card", { method: "PATCH", body: JSON.stringify({ cardId, status: nfcStatus }) });
      },
      completeAction: (id) => {
        set((s) => ({ completedActionIds: Array.from(new Set([...s.completedActionIds, id])) }));
        if (/^[0-9a-f-]{36}$/.test(id)) void live(get, set, `/api/actions/${id}`, { method: "PATCH", body: JSON.stringify({ done: true }) });
      },
      uncompleteAction: (id) => {
        set((s) => ({ completedActionIds: s.completedActionIds.filter((x) => x !== id) }));
        if (/^[0-9a-f-]{36}$/.test(id)) void live(get, set, `/api/actions/${id}`, { method: "PATCH", body: JSON.stringify({ done: false }) });
      },
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
      },
      setPlan: (selectedPlan) => set({ selectedPlan }),
      resetDemo: () => set({ ...initial, hydrated: true, mode: get().mode, liveDataset: get().liveDataset }),
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
