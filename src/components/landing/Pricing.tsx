"use client";

import { Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ANNUAL_PER_MONTH, ANNUAL_PRICE, MONTHLY_PRICE, PLANS, formatMoney } from "@/lib/billing/plans";
import { cn } from "@/lib/utils";

export function Pricing() {
  const [annual, setAnnual] = useState(false);
  const monthly = annual ? ANNUAL_PER_MONTH : MONTHLY_PRICE;
  return (
    <section id="pricing" className="bg-canvas py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600">Pricing</p>
          <h2 className="mt-2 text-[30px] font-extrabold tracking-tight text-navy-900 sm:text-[36px]">${MONTHLY_PRICE} a month. Pick your setup.</h2>
          <p className="mt-3 text-[15.5px] text-ink-muted">Every plan runs on the same software. Your first payment covers getting you set up. No contracts, cancel anytime.</p>
          <div className="mt-6 inline-flex items-center rounded-xl bg-white p-1 ring-1 ring-inset ring-line" role="tablist" aria-label="Billing period">
            <button role="tab" aria-selected={!annual} onClick={() => setAnnual(false)} className={cn("h-9 rounded-lg px-4 text-[13px] font-semibold transition-all", !annual ? "bg-navy-900 text-white shadow" : "text-ink-muted hover:text-ink")}>
              Monthly
            </button>
            <button role="tab" aria-selected={annual} onClick={() => setAnnual(true)} className={cn("inline-flex h-9 items-center gap-1.5 rounded-lg px-4 text-[13px] font-semibold transition-all", annual ? "bg-navy-900 text-white shadow" : "text-ink-muted hover:text-ink")}>
              Annual <span className={cn("rounded-md px-1.5 py-px text-[11px] font-bold", annual ? "bg-white/15 text-white" : "bg-success-100 text-success-600")}>3 months free</span>
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {PLANS.map((p) => (
            <div key={p.id} className={cn("card relative flex flex-col p-6", p.highlight && "border-brand-400 ring-2 ring-brand-100")}>
              {p.highlight && <span className="absolute -top-3 left-6 rounded-full bg-brand-600 px-2.5 py-0.5 text-[11px] font-bold text-white">Most popular</span>}
              <p className="text-[18px] font-extrabold text-navy-900">{p.name}</p>
              <p className="mt-1 min-h-[42px] text-[14px] text-ink-muted">{p.tagline}</p>
              <p className="mt-4 text-[15px] font-semibold text-ink">
                <span className="text-[30px] font-extrabold leading-none text-navy-900 tabular">{formatMoney(p.setupFee)}</span> to start
              </p>
              <p className="mt-1 text-[15px] text-ink-muted">
                then <strong className="text-navy-900 tabular">${monthly.toFixed(annual ? 2 : 0)}</strong>/mo{annual ? `, billed $${ANNUAL_PRICE} a year` : ""}
              </p>
              <ul className="mt-5 flex-1 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13.5px] text-ink">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" /> {f}
                  </li>
                ))}
              </ul>
              <Button className="mt-6" full variant={p.highlight ? "primary" : "outline"} href="/onboarding">
                {p.cta}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col items-start gap-3 rounded-2xl border border-brand-100 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-brand text-white">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[16px] font-bold text-navy-900">Pay for the year, get 3 months free.</p>
              <p className="text-[13.5px] text-ink-muted">
                ${ANNUAL_PRICE} a year instead of ${MONTHLY_PRICE * 12}. That&apos;s ${ANNUAL_PER_MONTH.toFixed(2)} a month, on any plan. Setup fee still applies.
              </p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setAnnual(true)}>
            Show annual pricing
          </Button>
        </div>
        <p className="mt-4 text-center text-[12.5px] text-ink-subtle">No contracts. Keep the card even if you cancel. Cancel anytime from your billing page.</p>
      </div>
    </section>
  );
}
