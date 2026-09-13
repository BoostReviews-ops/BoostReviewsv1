"use client";

import { ExternalLink, Nfc, Star } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Logo } from "@/components/ui/Logo";
import { DEMO_REVIEW_CARD } from "@/lib/demo/seed";
import { useDemoStore } from "@/lib/store/demoStore";

export function RedirectClient({ slug }: { slug: string }) {
  const hydrated = useDemoStore((s) => s.hydrated);
  const destType = useDemoStore((s) => s.nfcDestinationType);
  const destUrl = useDemoStore((s) => s.nfcDestinationUrl);
  const status = useDemoStore((s) => s.nfcStatus);
  const recordTap = useDemoStore((s) => s.recordTap);
  const target = destUrl ?? DEMO_REVIEW_CARD.destinationUrl;
  void destType;

  const state = useMemo<"resolving" | "redirecting" | "paused" | "notfound">(() => {
    if (!hydrated) return "resolving";
    if (slug !== DEMO_REVIEW_CARD.slug) return "notfound";
    if ((status ?? DEMO_REVIEW_CARD.status) === "paused") return "paused";
    return "redirecting";
  }, [hydrated, slug, status]);

  useEffect(() => {
    const t = setTimeout(() => useDemoStore.getState().setHydrated(), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (state !== "redirecting") return;
    const isQr = new URLSearchParams(window.location.search).get("src") === "qr";
    recordTap(DEMO_REVIEW_CARD.id, isQr ? "qr" : "nfc");
    const timer = setTimeout(() => {
      window.location.href = target;
    }, 1400);
    return () => clearTimeout(timer);
  }, [state, target, recordTap]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-6 text-center">
      <div className="card w-full max-w-sm p-8 animate-fade-up">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl gradient-brand text-white">
          {state === "notfound" ? <Nfc className="h-6 w-6" /> : <Star className="h-6 w-6 fill-white" />}
        </div>
        {state === "resolving" && (
          <>
            <p className="mt-5 text-lg font-bold text-navy-900">One moment…</p>
            <p className="mt-1 text-sm text-ink-muted">Finding your review page.</p>
          </>
        )}
        {state === "redirecting" && (
          <>
            <p className="mt-5 text-lg font-bold text-navy-900">Thanks for visiting Royal Massage &amp; Spa!</p>
            <p className="mt-1 text-sm text-ink-muted">Taking you to leave a review…</p>
            <div className="mx-auto mt-4 h-1.5 w-40 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-brand-500" style={{ animation: "grow 1.4s linear forwards" }} />
            </div>
            <a href={target} className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-600">
              Continue <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <style>{`@keyframes grow { from { width: 0 } to { width: 100% } }`}</style>
          </>
        )}
        {state === "paused" && (
          <>
            <p className="mt-5 text-lg font-bold text-navy-900">Reviews are temporarily paused</p>
            <p className="mt-1 text-sm text-ink-muted">This review card is paused by the business. Please check back soon.</p>
          </>
        )}
        {state === "notfound" && (
          <>
            <p className="mt-5 text-lg font-bold text-navy-900">Card not found</p>
            <p className="mt-1 text-sm text-ink-muted">This review link isn&apos;t active. If you&apos;re the business owner, check your Review Card settings.</p>
          </>
        )}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-ink-subtle">
          Powered by <Logo height={16} href="/" />
        </div>
      </div>
    </div>
  );
}
