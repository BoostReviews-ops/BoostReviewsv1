"use client";

import { ArrowUpRight, Info, MapPin, Phone, Star, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { MONTHLY_PRICE } from "@/lib/billing/plans";

/**
 * Interactive "what's it worth" estimator. Every assumption is visible and
 * adjustable; the numbers are illustrative, not a guarantee.
 */
export function ImpactCalculator() {
  const [customers, setCustomers] = useState(40);       // new customers/month from Google today
  const [value, setValue] = useState(120);              // average value of one customer
  const [rating, setRating] = useState(4.2);            // current Google rating
  const [reviewsPerMonth, setReviewsPerMonth] = useState(3);

  const model = useMemo(() => {
    const targetRating = Math.max(rating, 4.8);
    // Assumption 1: each +0.1 star ≈ +3% more searchers choose you (conversion).
    const ratingLift = Math.max(0, (targetRating - rating) / 0.1) * 0.03;
    // Assumption 2: steady review volume lifts map-pack visibility. Going from
    // ~3/mo to ~15–25/mo with a counter card ≈ +10–35% more profile views.
    const targetReviews = Math.max(18, Math.round(reviewsPerMonth * 1.3));
    const visibilityLift = Math.min(0.35, Math.max(0, (targetReviews - reviewsPerMonth) / 18) * 0.25);
    const lift = ratingLift + visibilityLift;
    const extraCustomers = customers * lift;
    const extraRevenueMonth = extraCustomers * value;
    const rankNow = rating >= 4.7 && reviewsPerMonth >= 12 ? 1 : rating >= 4.5 ? 2 : rating >= 4.2 ? 4 : 6;
    return {
      lift,
      ratingLift,
      visibilityLift,
      targetRating,
      targetReviews,
      extraCustomers,
      extraRevenueMonth,
      extraRevenueYear: extraRevenueMonth * 12,
      rankNow,
      rankAfter: Math.max(1, Math.min(rankNow, 2)),
      paybackMultiple: extraRevenueMonth / MONTHLY_PRICE,
    };
  }, [customers, value, rating, reviewsPerMonth]);

  const before = customers * value;
  const after = before + model.extraRevenueMonth;
  const barMax = Math.max(after, 1);

  return (
    <div className="mt-10 grid gap-5 lg:grid-cols-[400px_1fr] lg:gap-8">
      {/* Inputs */}
      <div className="card p-5 sm:p-6">
        <p className="text-[12px] font-bold uppercase tracking-wider text-ink-subtle">Your business today</p>
        <Slider label="New customers from Google each month" value={customers} min={5} max={300} step={5} onChange={setCustomers} format={(v) => `${v}`} />
        <Slider label="Average value of one customer" value={value} min={20} max={1500} step={10} onChange={setValue} format={(v) => formatCurrency(v)} />
        <Slider label="Your Google rating now" value={rating} min={3.5} max={4.9} step={0.1} onChange={setRating} format={(v) => v.toFixed(1) + " ★"} />
        <Slider label="New reviews you get each month" value={reviewsPerMonth} min={0} max={30} step={1} onChange={setReviewsPerMonth} format={(v) => `${v}`} />
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-canvas p-3 text-[12px] leading-snug text-ink-muted">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
          Assumes reaching a {model.targetRating.toFixed(1)}-star rating and about {model.targetReviews} new reviews a month. Each +0.1 star ≈ 3% more searchers choose you; steadier reviews lift map visibility up to 35%. Illustrative, not a guarantee.
        </p>
      </div>

      {/* Outputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card p-5 sm:col-span-2">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-wider text-ink-subtle">Estimated extra revenue</p>
              <p className="mt-1 text-[36px] font-extrabold leading-none tracking-tight text-navy-900 tabular">
                {formatCurrency(model.extraRevenueMonth)}
                <span className="text-base font-semibold text-ink-muted"> / month</span>
              </p>
              <p className="mt-1 text-[14px] text-ink-muted">
                about <strong className="text-ink">{formatCurrency(model.extraRevenueYear)}</strong> a year · roughly <strong className="text-ink">{Math.round(model.extraCustomers)}</strong> more customers a month
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-success-100 px-3 py-1 text-[13px] font-bold text-success-600">
              <ArrowUpRight className="h-4 w-4" /> +{Math.round(model.lift * 100)}% more business from Google
            </span>
          </div>
          <div className="mt-5 space-y-3">
            <Bar label="Revenue from Google today" value={before} max={barMax} tone="muted" />
            <Bar label="With a stronger reputation" value={after} max={barMax} tone="brand" />
          </div>
          <p className="mt-4 text-[13px] text-ink-muted">
            The software is ${MONTHLY_PRICE} a month. At these numbers it pays for itself{" "}
            <strong className="text-ink">{model.paybackMultiple >= 1 ? `${model.paybackMultiple.toFixed(model.paybackMultiple >= 10 ? 0 : 1)}×` : "in the first month"}</strong> over.
          </p>
        </div>

        {/* Map pack mock */}
        <div className="card p-5">
          <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-ink-subtle">
            <MapPin className="h-3.5 w-3.5" /> Where you show up on Google
          </p>
          <ul className="mt-3 space-y-1.5">
            {[1, 2, 3, 4, 5, 6].map((pos) => {
              const you = pos === model.rankAfter;
              const wasYou = pos === model.rankNow && model.rankNow !== model.rankAfter;
              return (
                <li key={pos} className={cn("flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-[13px] transition-all", you ? "bg-brand-50 ring-1 ring-brand-100" : wasYou ? "opacity-50" : "")}>
                  <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold", you ? "bg-brand-600 text-white" : "bg-canvas text-ink-subtle")}>{pos}</span>
                  <span className={cn("flex-1 truncate font-semibold", you ? "text-navy-900" : "text-ink-muted")}>{you ? "Your business" : wasYou ? "Your business today" : ["Competitor A", "Competitor B", "Competitor C", "Competitor D", "Competitor E", "Competitor F"][pos - 1]}</span>
                  <span className="inline-flex items-center gap-0.5 text-[12px] text-ink-muted">
                    <Star className="h-3 w-3 fill-warning-500 text-warning-500" /> {you ? model.targetRating.toFixed(1) : wasYou ? rating.toFixed(1) : (4.6 - pos * 0.08).toFixed(1)}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-[12px] text-ink-muted">Most people never scroll past the top three. Rating and review activity are two of the strongest signals Google uses to rank them.</p>
        </div>

        {/* Why it works */}
        <div className="card p-5">
          <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-brand-600">
            <TrendingUp className="h-3.5 w-3.5" /> The 3 levers
          </p>
          <h3 className="mt-1.5 text-[18px] font-extrabold leading-tight text-navy-900">Rank higher. Get seen. Get chosen.</h3>
          <p className="mt-1 text-[13px] text-ink-muted">Three things move the needle on Google. BoostReviewsAI works all three at once.</p>
          <ul className="mt-4 space-y-3">
            {[
              { icon: <Star className="h-4 w-4" />, t: "Higher rating", d: `${rating.toFixed(1)} → ${model.targetRating.toFixed(1)} stars means more of the people who find you pick you (+${Math.round(model.ratingLift * 100)}%).` },
              { icon: <MapPin className="h-4 w-4" />, t: "More reviews, more visibility", d: `${reviewsPerMonth} → ${model.targetReviews} reviews a month keeps your profile active and climbing (+${Math.round(model.visibilityLift * 100)}% views).` },
              { icon: <Phone className="h-4 w-4" />, t: "Replies build trust", d: "Answered reviews show future customers someone is paying attention. One tap to approve, and it's done." },
            ].map((x) => (
              <li key={x.t} className="flex gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">{x.icon}</span>
                <span>
                  <span className="block text-[14px] font-semibold text-ink">{x.t}</span>
                  <span className="block text-[12.5px] leading-snug text-ink-muted">{x.d}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange, format }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; format: (v: number) => string }) {
  return (
    <label className="mt-4 block">
      <span className="flex items-center justify-between text-[13px]">
        <span className="font-medium text-ink">{label}</span>
        <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[12px] font-bold text-brand-700 tabular">{format(value)}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-line accent-brand-600" aria-label={label} />
    </label>
  );
}

function Bar({ label, value, max, tone }: { label: string; value: number; max: number; tone: "muted" | "brand" }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[12.5px]">
        <span className="text-ink-muted">{label}</span>
        <span className="font-semibold text-ink tabular">{formatCurrency(value)}/mo</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-canvas ring-1 ring-inset ring-line">
        <div className={cn("h-full rounded-full transition-all duration-700 ease-out", tone === "brand" ? "gradient-brand" : "bg-line-strong")} style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  );
}
