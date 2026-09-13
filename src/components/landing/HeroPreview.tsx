"use client";

import { ArrowUpRight, CheckCircle2, AlertTriangle, Nfc, Star } from "lucide-react";
import { ScoreRing } from "@/components/charts/ScoreRing";
import { Sparkline } from "@/components/charts/Sparkline";

/** Static, hand-tuned preview of the dashboard for the landing hero. */
export function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[520px] animate-fade-up lg:mx-0" style={{ animationDelay: "120ms" }}>
      <div className="pointer-events-none absolute -inset-6 rounded-[36px] bg-gradient-to-br from-brand-100/60 via-white/0 to-sky-100/60 blur-2xl" />
      <div className="relative overflow-hidden rounded-3xl border border-line bg-white shadow-[var(--shadow-pop)]">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-navy-900 text-[10px] font-bold text-white">RM</span>
            <div>
              <p className="text-[13px] font-semibold leading-tight text-ink">Royal Massage &amp; Spa</p>
              <p className="text-[10.5px] leading-tight text-ink-subtle">Overview · last 30 days</p>
            </div>
          </div>
          <span className="rounded-full bg-success-100 px-2 py-0.5 text-[11px] font-semibold text-success-600">Live demo</span>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-5">
            <ScoreRing value={87} size={136} stroke={11} tone="strong" label="Strong" sublabel="out of 100" />
            <div className="min-w-0 flex-1">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-brand-600">Reputation Score</p>
              <p className="mt-1 text-[19px] font-extrabold leading-tight text-navy-900">Your reputation is strong</p>
              <p className="mt-1 inline-flex items-center gap-1 rounded-md bg-success-100 px-1.5 py-0.5 text-[12px] font-semibold text-success-600">
                <ArrowUpRight className="h-3.5 w-3.5" /> +6 pts this month
              </p>
              <ul className="mt-2.5 space-y-1 text-[12px] text-ink">
                <li><span className="font-bold text-success-600">+4</span> Strong review growth</li>
                <li><span className="font-bold text-success-600">+1</span> Improved response rate</li>
                <li><span className="font-bold text-danger-600">−1</span> Competitor gaining faster</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { l: "Google rating", v: "4.8", icon: <Star className="h-3.5 w-3.5 fill-warning-500 text-warning-500" /> },
              { l: "New reviews", v: "+31", sub: "+22%" },
              { l: "NFC taps", v: "188", sub: "+18%" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl border border-line bg-canvas/60 p-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-subtle">{s.l}</p>
                <p className="mt-0.5 flex items-center gap-1 text-[18px] font-extrabold leading-none text-navy-900 tabular">
                  {s.v}
                  {s.icon}
                  {s.sub && <span className="ml-1 text-[10.5px] font-semibold text-success-600">{s.sub}</span>}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-line p-3">
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-success-600">
                <CheckCircle2 className="h-3.5 w-3.5" /> What&apos;s working
              </p>
              <p className="mt-1 text-[12px] leading-snug text-ink">Review growth is accelerating — 31 this month vs 25 last month.</p>
              <Sparkline data={[21, 22, 24, 27, 25, 31]} width={120} height={22} className="mt-1.5" color="#16a34a" />
            </div>
            <div className="rounded-xl border border-line p-3">
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-warning-600">
                <AlertTriangle className="h-3.5 w-3.5" /> Needs attention
              </p>
              <p className="mt-1 text-[12px] leading-snug text-ink">5 reviews still need a reply. Wait-time mentions are up.</p>
              <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600">
                <Nfc className="h-3 w-3" /> Generate AI replies →
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
