"use client";

import { Crown, MapPin, TrendingDown, TrendingUp, Trophy } from "lucide-react";
import { useState } from "react";
import { ClientOnly, PageHeader } from "@/components/app/Common";
import { Sparkline } from "@/components/charts/Sparkline";
import { Bars } from "@/components/charts/Trend";
import { Badge, Delta } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/Misc";
import { Stars } from "@/components/ui/Stars";
import { useBusinessData } from "@/lib/hooks/useBusinessData";
import type { Competitor } from "@/lib/types";
import { cn, formatPct } from "@/lib/utils";

export default function CompetitorsPage() {
  return (
    <ClientOnly>
      <Competitors />
    </ClientOnly>
  );
}

function Competitors() {
  const d = useBusinessData();
  const [active, setActive] = useState<Competitor | null>(null);
  const all = [d.you, ...d.competitors].sort((a, b) => b.reviewsThisMonth - a.reviewsThisMonth);
  const maxMonth = Math.max(...all.map((c) => c.reviewsThisMonth));
  const growthData = all.map((c) => ({ label: c.isYou ? "You" : c.name.split(" ")[0], reviews: c.reviewsThisMonth }));
  const youIdx = growthData.findIndex((g) => g.label === "You");

  return (
    <>
      <PageHeader title="Competitors" subtitle="How you compare with nearby businesses customers also consider" />

      <section className="grid gap-4 md:grid-cols-3">
        <div className="card p-5 md:col-span-1">
          <p className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-700">
            <Trophy className="h-3.5 w-3.5" /> Review growth
          </p>
          <p className="mt-2.5 text-[20px] font-extrabold leading-tight text-navy-900">{d.compInsight.headline}</p>
          <p className="mt-1.5 text-[13.5px] text-ink-muted">{d.compInsight.bullets[0]}</p>
        </div>
        <div className="card p-5">
          <p className="inline-flex items-center gap-1.5 rounded-lg bg-success-100 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-success-600">
            <Crown className="h-3.5 w-3.5" /> Rating
          </p>
          <p className="mt-2.5 text-[20px] font-extrabold leading-tight text-navy-900">{d.compInsight.rankByRating === 1 ? "Highest rating in the area" : `#${d.compInsight.rankByRating} for rating`}</p>
          <p className="mt-1.5 text-[13.5px] text-ink-muted">Your {d.googleRating.toFixed(1)} beats every tracked competitor. Rating is your strongest advantage — protect it by answering every review.</p>
        </div>
        <div className="card p-5">
          <p className="inline-flex items-center gap-1.5 rounded-lg bg-warning-100 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-warning-600">
            <TrendingUp className="h-3.5 w-3.5" /> Momentum
          </p>
          <p className="mt-2.5 text-[20px] font-extrabold leading-tight text-navy-900">{d.compInsight.leader ? `${d.compInsight.leader.name.split(" ")[0]} is accelerating` : "You lead on momentum"}</p>
          <p className="mt-1.5 text-[13.5px] text-ink-muted">{d.compInsight.bullets[2] ?? d.compInsight.bullets[1]}</p>
        </div>
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader title="Tracked businesses" subtitle="Ranked by reviews gained this month · tap a row for details" />
          <CardBody className="pt-2">
            <ul className="divide-y divide-line">
              {all.map((c, i) => (
                <li key={c.id}>
                  <button onClick={() => setActive(c)} className={cn("-mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-xl px-2 py-3 text-left transition-colors hover:bg-canvas", c.isYou && "bg-brand-50/60 hover:bg-brand-50")}>
                    <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[13px] font-bold tabular", i === 0 ? "bg-navy-900 text-white" : "bg-canvas text-ink-muted")}>#{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="truncate text-[14px] font-semibold text-ink">{c.isYou ? "Royal Massage & Spa" : c.name}</span>
                        {c.isYou && <Badge tone="brand">You</Badge>}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-ink-muted">
                        <span className="inline-flex items-center gap-1">
                          <Stars rating={c.rating} size={11} /> {c.rating.toFixed(1)}
                        </span>
                        <span>· {c.totalReviews} reviews</span>
                        {!c.isYou && (
                          <span className="inline-flex items-center gap-0.5">
                            · <MapPin className="h-3 w-3" /> {c.distanceMiles} mi
                          </span>
                        )}
                      </div>
                      <ProgressBar value={c.reviewsThisMonth} max={maxMonth} tone={c.isYou ? "brand" : "sky"} height={5} className="mt-2 max-w-[260px]" />
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[18px] font-extrabold text-navy-900 tabular">+{c.reviewsThisMonth}</p>
                      <Delta value={c.reviewsLastMonth ? c.reviewsThisMonth / c.reviewsLastMonth - 1 : 0} format={(v) => formatPct(v, { sign: true })} />
                    </div>
                    <Sparkline data={c.monthlyHistory} width={64} height={24} color={c.isYou ? "#1c74f5" : "#8a94ad"} className="hidden sm:block" />
                  </button>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Reviews gained this month" />
            <CardBody className="pt-3">
              <Bars data={growthData} dataKey="reviews" name="Reviews" height={190} highlightIndex={youIdx} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="What this means" />
            <CardBody className="pt-2">
              <ul className="space-y-2.5">
                {d.compInsight.bullets.map((b) => (
                  <li key={b} className="flex gap-2.5 text-[13.5px] leading-snug text-ink">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" /> {b}
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>
      </section>

      <Modal open={!!active} onClose={() => setActive(null)} title={active?.isYou ? "Royal Massage & Spa" : active?.name} description={active ? `${active.category}${active.isYou ? "" : ` · ${active.distanceMiles} miles away`}` : ""} size="sm">
        {active && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <Stat label="Rating" value={active.rating.toFixed(1)} />
              <Stat label="Total reviews" value={String(active.totalReviews)} />
              <Stat label="This month" value={`+${active.reviewsThisMonth}`} />
            </div>
            <div>
              <p className="mb-1 text-[12px] font-bold uppercase tracking-wider text-ink-subtle">New reviews · last 6 months</p>
              <Bars data={active.monthlyHistory.map((v, i) => ({ label: `M-${5 - i}`, reviews: v }))} dataKey="reviews" name="Reviews" height={150} />
            </div>
            {!active.isYou && (
              <div className="rounded-xl bg-canvas p-3.5 text-[13.5px] leading-snug text-ink">
                {active.reviewsThisMonth > d.you.reviewsThisMonth ? (
                  <>
                    <TrendingUp className="mr-1 inline h-4 w-4 text-warning-600" />
                    <strong>{active.name.split(" ")[0]}</strong> gained {active.reviewsThisMonth - d.you.reviewsThisMonth} more reviews than you this month. Your rating ({d.googleRating.toFixed(1)} vs {active.rating.toFixed(1)}) is still higher — keep the review card front and center to close the gap.
                  </>
                ) : (
                  <>
                    <TrendingDown className="mr-1 inline h-4 w-4 text-success-600" />
                    You out-gained <strong>{active.name.split(" ")[0]}</strong> by {d.you.reviewsThisMonth - active.reviewsThisMonth} reviews this month{active.rating < d.googleRating ? " and your rating is higher" : ""}.
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-canvas p-3 text-center">
      <p className="text-[18px] font-extrabold text-navy-900 tabular">{value}</p>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">{label}</p>
    </div>
  );
}
