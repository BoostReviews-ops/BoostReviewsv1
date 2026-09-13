"use client";

import { AlertTriangle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDemoStore } from "@/lib/store/demoStore";

const SUPABASE_ON = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

/**
 * Decides demo vs live for this browser and loads the live dataset.
 * - No Supabase configured, or the br_demo cookie is set → demo (seeded data).
 * - Otherwise → fetch /api/me/dataset; "onboarding" sends new users to set up.
 */
export function LiveDataLoader() {
  const router = useRouter();
  const setMode = useDemoStore((s) => s.setMode);
  const setLiveDataset = useDemoStore((s) => s.setLiveDataset);
  const liveError = useDemoStore((s) => s.liveError);
  const mode = useDemoStore((s) => s.mode);

  useEffect(() => {
    const demoCookie = typeof document !== "undefined" && /(^|; )br_demo=1/.test(document.cookie);
    if (!SUPABASE_ON || demoCookie) {
      setMode("demo");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/me/dataset", { cache: "no-store" });
        if (res.status === 401) {
          router.replace("/login?next=/app");
          return;
        }
        const json = (await res.json()) as { mode: string; dataset?: Parameters<typeof setLiveDataset>[0]; error?: string };
        if (cancelled) return;
        if (json.mode === "onboarding") {
          router.replace("/onboarding?setup=1");
          return;
        }
        if (json.mode === "live" && json.dataset) {
          setMode("live");
          setLiveDataset(json.dataset);
        } else {
          setMode("demo");
        }
      } catch (e) {
        if (!cancelled) setLiveDataset(null, (e as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, setMode, setLiveDataset]);

  if (!liveError || mode !== "live") return null;
  return (
    <div className="mx-4 mt-3 flex items-start gap-2 rounded-xl border border-danger-100 bg-danger-100/50 px-3 py-2 text-[13px] text-danger-600 sm:mx-6 lg:mx-8">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <span className="flex-1">Couldn&apos;t sync with the server: {liveError}</span>
      <button onClick={() => setLiveDataset(useDemoStore.getState().liveDataset, null)} aria-label="Dismiss" className="rounded p-0.5 hover:bg-white/60">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
