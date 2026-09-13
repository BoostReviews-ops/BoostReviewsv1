"use client";

import { ArrowRight, CheckCircle2, ChevronRight, Sparkles, TrendingUp, AlertTriangle, ThumbsUp, MessageCircleWarning, Nfc, Star, MessagesSquare, Globe, Zap } from "lucide-react";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { ClientOnly, PageHeader, RangePicker, StatCard } from "@/components/app/Common";
import { ScoreBreakdownModal } from "@/components/app/ScoreBreakdown";
import { ReviewRow } from "@/components/app/ReviewRow";
import { ActionCard } from "@/components/app/ActionCard";
import { ScoreRing } from "@/components/charts/ScoreRing";
import { Sparkline } from "@/components/charts/Sparkline";
import { Badge, Delta } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/Misc";
import { useBusinessData, type Insight } from "@/lib/hooks/useBusinessData";
import { cn, formatPct, formatSigned } from "@/lib/utils";

export default function OverviewPage() {
  return (
    <ClientOnly>
      <Overview />
    </ClientOnly>
  );
}

function InsightList({ items, tone }: { items: Insight[]; tone: "positive" | "warning" }) {
  return (
    <ul className="divide-y divide-line">
      {items.map((it) => (
        <li key={it.title}>
          <Link href={it.href ?? "#"} className="group -mx-2 flex items-start gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-canvas">
            <span className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", tone === "positive" ? "bg-success-100 text-success-600" : it.tone === "neutral" ? "bg-brand-50 text-brand-600" : "bg-warning-100 text-warning-600")}>
              {tone === "positive" ? <CheckCircle2 className="h-4 w-4" /> : it.tone === "neutral" ? <TrendingUp className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="text-[14px] font-semibold leading-snug text-ink">{it.title}</span>
                {it.metric && <Badge tone={tone === "positive" ? "success" : "warning"}>{it.metric}</Badge>}
              </span>
              <span className="mt-0.5 block text-[13px] leading-snug text-ink-muted">{it.detail}</span>
            </span>
            <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-ink-subtle transition-transform group-hover:translate-x-0.5" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Overview() {
  const d = useBusinessData();
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const m = d.metrics;
  const rangeIsMonth = d.dateRange === "30d";
  const recentReviews = d.reviews.slice(0, 4);
  const topPositive = d.positiveThemes.slice(0, 4);
  const rising = d.negativeThemes.filter((t) => t.count > 0).slice(0, 3);
  const scoreSpark = d.scoreHistory.slice(-12).map((s) => s.score);
  const ringSize = useRingSize();

  return (
    <>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            Good {greeting()}, Royal Massage &amp; Spa
          </span>
        }
        subtitle={`Here's how your reputation looks · ${m.label.toLowerCase()}`}
        action={<RangePicker />}
      />

      {/* ---------- HOW AM I DOING ---------- */}
      <section className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <Card className="relative overflow-hidden">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-sky-100/70 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-brand-50 blur-3xl" />
          <div className="relative flex h-full flex-col items-center gap-5 p-5 sm:flex-row sm:items-center sm:gap-8 sm:p-8">
            <button onClick={() => setBreakdownOpen(true)} className="group relative shrink-0 rounded-full transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100" aria-label="Open Reputation Score breakdown">
              <ScoreRing value={d.score.score} size={ringSize} stroke={15} tone={d.score.category.tone} label={d.score.category.label} sublabel="out of 100" />
            </button>
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600">BoostReviewsAI Reputation Score</p>
              <h2 className="mt-1.5 text-[24px] font-extrabold leading-tight tracking-tight text-navy-900 sm:text-[28px]">
                Your reputation is <span className="text-gradient-brand">{d.score.category.label.toLowerCase()}</span>
              </h2>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <Delta value={d.score.change} suffix=" pts" className="text-[13px]" />
                <span className="text-[13px] text-ink-muted">this month · was {d.score.previousScore}</span>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 sm:justify-start">
                {d.score.changeReasons.slice(0, 3).map((r) => (
                  <span key={r.label} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink">
                    <span className={cn("rounded-md px-1.5 py-px text-[12px] font-bold tabular", r.points > 0 ? "bg-success-100 text-success-600" : "bg-danger-100 text-danger-600")}>{formatSigned(r.points)}</span>
                    {r.label}
                  </span>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <Button size="sm" variant="secondary" onClick={() => setBreakdownOpen(true)} iconRight={<ArrowRight className="h-4 w-4" />}>
                  Why did my score change?
                </Button>
                <span className="hidden items-center gap-2 text-[12px] text-ink-subtle sm:inline-flex">
                  <Sparkline data={scoreSpark} width={80} height={24} /> 12-week trend
                </span>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <StatCard label="Google rating" value={<span className="inline-flex items-center gap-1.5">{d.googleRating.toFixed(1)}<Star className="h-5 w-5 fill-warning-500 text-warning-500" /></span>} deltaLabel={`${d.totalReviews} total reviews`} href="/app/reviews" compact />
          <StatCard label="Total reviews" value={d.totalReviews} delta={m.reviewsGained} deltaFormat={(v) => `+${v}`} deltaLabel={m.label.toLowerCase()} href="/app/reviews" compact />
          <StatCard label={rangeIsMonth ? "New this month" : "New reviews"} value={`+${m.reviewsGained}`} deltaLabel={rangeIsMonth ? `vs ${m.reviewsPrevious} last month` : `vs ${m.reviewsPrevious} prior period`} href="/app/reviews" compact spark={d.monthly.map((x) => x.count)} />
          <StatCard label="Review growth" value={formatPct(m.reviewGrowth, { sign: true })} deltaLabel={rangeIsMonth ? "vs 3-month average" : "vs prior period"} hint="How many more reviews you received this period compared with your recent baseline." href="/app/insights" compact />
          <StatCard label="Response rate" value={`${Math.round(d.score.factors.find((f) => f.key === "responseRate") ? (d.last90.filter((r) => r.response && (r.response.status === "responded" || r.response.status === "approved")).length / Math.max(1, d.last90.length)) * 100 : 0)}%`} deltaLabel={`${d.unanswered.length} unanswered`} hint="Share of reviews from the last 90 days that have a reply from you." href="/app/reviews?filter=unanswered" compact />
          <StatCard label="NFC taps" value={m.nfcTaps} delta={m.nfcChange} deltaFormat={(v) => formatPct(v, { sign: true })} deltaLabel={rangeIsMonth ? "vs last month" : "vs prior period"} href="/app/review-card" compact spark={d.weekly.slice(-8).map((w) => w.taps)} sparkColor="#14b1ef" />
        </div>
      </section>

      {/* ---------- WHAT CHANGED ---------- */}
      <section className="mt-5 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title="What's working" subtitle="Positive momentum this period" icon={<ThumbsUp className="h-4 w-4" />} />
          <CardBody className="pt-2">
            <InsightList items={d.whatsWorking} tone="positive" />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Needs attention" subtitle="Small things worth fixing this week" icon={<MessageCircleWarning className="h-4 w-4" />} />
          <CardBody className="pt-2">
            <InsightList items={d.needsAttention} tone="warning" />
          </CardBody>
        </Card>
      </section>

      {/* ---------- NEXT BEST ACTION ---------- */}
      <section className="mt-5">
        <Card className="overflow-hidden border-brand-100 bg-gradient-to-br from-white via-white to-brand-50/70">
          <CardHeader
            title={
              <span className="inline-flex items-center gap-2">
                <Zap className="h-4 w-4 text-brand-600" /> Your next best moves
              </span>
            }
            subtitle="Prioritized by impact on your Reputation Score"
            href="/app/reports"
          />
          <CardBody className="pt-3">
            {d.openActions.length === 0 ? (
              <div className="flex items-center gap-3 rounded-2xl bg-success-100/60 p-4 text-success-600">
                <CheckCircle2 className="h-5 w-5" />
                <p className="text-sm font-semibold">You&apos;ve completed every recommended action. Nice work — check back next week.</p>
              </div>
            ) : (
              <div className="grid gap-3 lg:grid-cols-3">
                {d.openActions.map((a, i) => (
                  <ActionCard key={a.id} action={a} index={i + 1} />
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </section>

      {/* ---------- WHAT ARE CUSTOMERS SAYING ---------- */}
      <section className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader title="Customers love" subtitle={`What comes up most in the last 90 days (${d.last90.length} reviews)`} href="/app/insights" />
          <CardBody className="space-y-3.5 pt-3">
            {topPositive.map((t) => (
              <div key={t.key}>
                <div className="mb-1.5 flex items-center justify-between text-[13px]">
                  <span className="font-semibold text-ink">{t.label}</span>
                  <span className="flex items-center gap-2 text-ink-muted">
                    <span className="tabular">{Math.round(t.share * 100)}% of reviews</span>
                    {t.change !== 0 && <Delta value={t.change} format={(v) => formatPct(v, { sign: true })} />}
                  </span>
                </div>
                <ProgressBar value={t.share * 100} tone="success" height={7} />
              </div>
            ))}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Customers are mentioning" subtitle="Emerging themes to keep an eye on" href="/app/insights" />
          <CardBody className="space-y-3.5 pt-3">
            {rising.map((t) => (
              <div key={t.key}>
                <div className="mb-1.5 flex items-center justify-between text-[13px]">
                  <span className="font-semibold text-ink">{t.label}</span>
                  <span className="flex items-center gap-2 text-ink-muted">
                    <span className="tabular">{t.count} mention{t.count === 1 ? "" : "s"}</span>
                    <Delta value={t.change} invert format={(v) => formatPct(v, { sign: true })} />
                  </span>
                </div>
                <ProgressBar value={Math.max(6, t.share * 100 * 3)} tone={t.change > 0.1 ? "warning" : "sky"} height={7} />
              </div>
            ))}
            {rising[0] && rising[0].change > 0 && (
              <p className="rounded-xl bg-warning-100/60 px-3 py-2.5 text-[13px] leading-snug text-warning-600">
                <strong>One issue is emerging.</strong> Negative mentions of {rising[0].label.toLowerCase()} increased {formatPct(rising[0].change)} over the last 90 days.
              </p>
            )}
          </CardBody>
        </Card>
      </section>

      {/* ---------- HOW DO I COMPARE / PROFILE / NFC ---------- */}
      <section className="mt-5 grid gap-4 md:grid-cols-3">
        <Link href="/app/competitors" className="card card-hover p-5">
          <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-ink-subtle">
            <TrendingUp className="h-4 w-4" /> Competitors
          </p>
          <p className="mt-2 text-[22px] font-extrabold leading-tight text-navy-900">#{d.compInsight.rankByGrowth} of {d.compInsight.total} for review growth</p>
          <p className="mt-1.5 text-[13px] leading-snug text-ink-muted">{d.compInsight.bullets[0]}</p>
          {d.compInsight.rankByRating === 1 && <Badge tone="success" className="mt-3">Highest rating in the area</Badge>}
        </Link>
        <Link href="/app/google-profile" className="card card-hover p-5">
          <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-ink-subtle">
            <Globe className="h-4 w-4" /> Google Profile Health
          </p>
          <div className="mt-2 flex items-center gap-3">
            <p className="text-[22px] font-extrabold leading-tight text-navy-900">
              {d.health.score}<span className="text-base font-semibold text-ink-subtle">/100</span>
            </p>
            <Badge tone={d.health.category.tone === "excellent" || d.health.category.tone === "strong" ? "success" : "warning"}>{d.health.category.label}</Badge>
          </div>
          <ProgressBar value={d.health.score} tone="brand" height={7} className="mt-3" />
          <p className="mt-2 text-[13px] leading-snug text-ink-muted">
            {d.health.checks.filter((c) => c.status === "pass").length} of {d.health.checks.length} checks passing · {d.health.checks.filter((c) => c.status !== "pass").length} to improve
          </p>
        </Link>
        <Link href="/app/review-card" className="card card-hover p-5">
          <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-ink-subtle">
            <Nfc className="h-4 w-4" /> Review card
          </p>
          <p className="mt-2 text-[22px] font-extrabold leading-tight text-navy-900">{d.m30.nfcTaps} taps this month</p>
          <p className="mt-1.5 text-[13px] leading-snug text-ink-muted">
            {formatPct(d.m30.nfcChange, { sign: true })} vs last month · {d.taps7} this week · busiest on {d.peakDay.dayName}s
          </p>
          <div className="mt-3 flex items-end gap-1">
            {d.weekly.slice(-8).map((w, i, arr) => (
              <span key={w.label} className={cn("flex-1 rounded-sm", i === arr.length - 1 ? "bg-sky-400" : "bg-brand-100")} style={{ height: 6 + (w.taps / Math.max(...arr.map((x) => x.taps))) * 26 }} />
            ))}
          </div>
        </Link>
      </section>

      {/* ---------- RECENT REVIEWS ---------- */}
      <section className="mt-5">
        <Card>
          <CardHeader title="Recent reviews" subtitle={`${d.unansweredRecent.length} recent review${d.unansweredRecent.length === 1 ? "" : "s"} still need${d.unansweredRecent.length === 1 ? "s" : ""} a reply`} icon={<MessagesSquare className="h-4 w-4" />} href="/app/reviews" />
          <CardBody className="pt-2">
            <div className="divide-y divide-line">
              {recentReviews.map((r) => (
                <ReviewRow key={r.id} review={r} compact />
              ))}
            </div>
            <Button variant="outline" href="/app/reviews" full className="mt-4 sm:hidden">
              See all reviews
            </Button>
          </CardBody>
        </Card>
      </section>

      {/* ---------- WEBSITE UPSELL (separate service) ---------- */}
      <section className="mt-5">
        <Link href="/app/website" className="card card-hover flex flex-col gap-4 overflow-hidden p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl gradient-brand text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600">Website upgrade · separate service</p>
            <p className="mt-0.5 text-[16px] font-bold text-ink">Your website should work as hard as your reputation.</p>
            <p className="mt-0.5 text-[13px] text-ink-muted">Professional refresh, mobile optimization, and booking/contact improvements — on your own domain.</p>
          </div>
          <span className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-navy-900 px-4 text-sm font-semibold text-white">
            Request website audit <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </section>

      <ScoreBreakdownModal open={breakdownOpen} onClose={() => setBreakdownOpen(false)} />
    </>
  );
}

function useRingSize() {
  const wide = useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(min-width: 1024px)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(min-width: 1024px)").matches,
    () => false,
  );
  return wide ? 224 : 196;
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
}
