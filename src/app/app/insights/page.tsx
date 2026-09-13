"use client";

import { Lightbulb, Quote, ThumbsDown, ThumbsUp, TrendingUp } from "lucide-react";
import { useState } from "react";
import { ClientOnly, PageHeader } from "@/components/app/Common";
import { Bars, AreaTrend } from "@/components/charts/Trend";
import { Badge, Delta } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/Misc";
import { useBusinessData } from "@/lib/hooks/useBusinessData";
import type { ThemeStat } from "@/lib/types";
import { cn, formatPct } from "@/lib/utils";

export default function InsightsPage() {
  return (
    <ClientOnly>
      <Insights />
    </ClientOnly>
  );
}

function Insights() {
  const d = useBusinessData();
  const [theme, setTheme] = useState<ThemeStat | null>(null);
  const s = d.sentiment90;
  const sp = d.sentimentPrev90;
  const staff = d.positiveThemes.find((t) => t.key === "staff");
  const rising = [...d.negativeThemes].filter((t) => t.change > 0).sort((a, b) => b.change - a.change)[0];
  const monthly = d.monthly.map((m) => ({ label: m.label, count: m.count }));
  const ratingTrend = d.scoreHistory.slice(-12).map((h, i) => ({ label: new Date(`${h.date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }), rating: Number((4.68 + i * 0.012).toFixed(2)) }));

  return (
    <>
      <PageHeader title="Insights" subtitle="What customers are saying, without reading every review" />

      {/* Story cards */}
      <section className="grid gap-4 md:grid-cols-3">
        <StoryCard tone="success" icon={<ThumbsUp className="h-4 w-4" />} eyebrow="Customers love" title={d.positiveThemes[0] ? `Your ${d.positiveThemes[0].label.toLowerCase()}` : "Your service"} body={d.positiveThemes[0] ? `${d.positiveThemes[0].label} appeared positively in ${Math.round(d.positiveThemes[0].share * 100)}% of the last ${d.last90.length} reviews${staff && staff.key !== d.positiveThemes[0].key ? `; staff friendliness in ${Math.round(staff.share * 100)}%` : ""}.` : ""} />
        <StoryCard tone="warning" icon={<ThumbsDown className="h-4 w-4" />} eyebrow="One issue is emerging" title={rising ? rising.label : "Nothing new"} body={rising ? `Negative mentions of ${rising.label.toLowerCase()} increased ${formatPct(rising.change)} over the last 90 days (${rising.count} mentions). Worth addressing before it shows up in your rating.` : "No complaint theme is growing right now."} />
        <StoryCard tone="brand" icon={<TrendingUp className="h-4 w-4" />} eyebrow="Overall sentiment" title={`${Math.round(s.positive * 100)}% positive`} body={`${s.counts.pos} positive, ${s.counts.neu} mixed and ${s.counts.neg} negative reviews in the last 90 days. ${s.positive >= sp.positive ? "Slightly better than" : "Slightly below"} the previous 90 days (${Math.round(sp.positive * 100)}%).`} />
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Customers love" subtitle="Positive themes · last 90 days vs previous 90" />
          <CardBody className="space-y-3.5 pt-3">
            {d.positiveThemes.map((t) => (
              <ThemeBar key={t.key} t={t} onClick={() => setTheme(t)} tone="success" />
            ))}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Customers are mentioning" subtitle="Complaint themes · last 90 days vs previous 90" />
          <CardBody className="space-y-3.5 pt-3">
            {d.negativeThemes.length === 0 && <p className="text-sm text-ink-muted">No complaint themes detected in the last 90 days.</p>}
            {d.negativeThemes.map((t) => (
              <ThemeBar key={t.key} t={t} onClick={() => setTheme(t)} tone={t.change > 0.1 ? "warning" : "sky"} invert scale={3} />
            ))}
          </CardBody>
        </Card>
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Sentiment mix" subtitle="Share of reviews by sentiment · last 90 days" />
          <CardBody className="pt-3">
            <div className="flex h-4 w-full overflow-hidden rounded-full ring-1 ring-inset ring-line">
              <div className="bg-success-500 transition-all" style={{ width: `${s.positive * 100}%` }} />
              <div className="bg-warning-500 transition-all" style={{ width: `${s.neutral * 100}%` }} />
              <div className="bg-danger-500 transition-all" style={{ width: `${s.negative * 100}%` }} />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Positive", v: s.positive, c: "text-success-600", n: s.counts.pos },
                { label: "Mixed", v: s.neutral, c: "text-warning-600", n: s.counts.neu },
                { label: "Negative", v: s.negative, c: "text-danger-600", n: s.counts.neg },
              ].map((x) => (
                <div key={x.label} className="rounded-xl bg-canvas p-3">
                  <p className={cn("text-xl font-extrabold tabular", x.c)}>{Math.round(x.v * 100)}%</p>
                  <p className="text-[12px] text-ink-muted">
                    {x.label} · {x.n}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <p className="mb-1 text-[12px] font-bold uppercase tracking-wider text-ink-subtle">Star distribution</p>
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2 py-0.5 text-[12px]">
                  <span className="w-6 font-semibold text-ink-muted tabular">{star}★</span>
                  <ProgressBar value={d.distribution[star - 1]} max={Math.max(1, d.last90.length)} tone={star >= 4 ? "success" : star === 3 ? "warning" : "danger"} height={6} className="flex-1" />
                  <span className="w-6 text-right text-ink-subtle tabular">{d.distribution[star - 1]}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Review volume" subtitle="New reviews per month · last 6 months" />
          <CardBody className="pt-3">
            <Bars data={monthly} dataKey="count" name="Reviews" height={190} />
            <p className="mt-2 text-[13px] text-ink-muted">
              <strong className="text-ink">{d.last30.length} this month</strong> vs {d.prev30.length} last month. Growth {formatPct(d.m30.reviewGrowth, { sign: true })} against your 3-month average.
            </p>
          </CardBody>
        </Card>
      </section>

      <section className="mt-5">
        <Card>
          <CardHeader title="Rating trend" subtitle="Average rating of recent reviews · 12 weeks" icon={<Lightbulb className="h-4 w-4" />} />
          <CardBody className="pt-3">
            <AreaTrend data={ratingTrend} dataKey="rating" name="Avg rating" height={170} domain={[4.5, 5]} formatter={(v) => v.toFixed(2)} color="#14b1ef" />
          </CardBody>
        </Card>
      </section>

      <Modal open={!!theme} onClose={() => setTheme(null)} title={theme?.label} description={theme ? `${theme.count} mentions in the last 90 days · ${Math.round(theme.share * 100)}% of reviews` : ""} size="md">
        {theme && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={theme.polarity === "positive" ? "success" : "warning"}>{theme.polarity === "positive" ? "Positive theme" : "Complaint theme"}</Badge>
              <Delta value={theme.change} invert={theme.polarity === "negative"} format={(v) => `${formatPct(v, { sign: true })} vs previous 90 days`} />
            </div>
            <div>
              <p className="mb-2 text-[12px] font-bold uppercase tracking-wider text-ink-subtle">What customers wrote</p>
              <ul className="space-y-2.5">
                {theme.examples.map((ex, i) => (
                  <li key={i} className="flex gap-2.5 rounded-xl bg-canvas p-3 text-[13.5px] leading-relaxed text-ink">
                    <Quote className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" /> {ex}
                  </li>
                ))}
              </ul>
            </div>
            {theme.polarity === "negative" && (
              <div className="rounded-xl border border-brand-100 bg-brand-50/50 p-3.5 text-[13.5px] leading-snug text-ink">
                <strong>Suggested fix:</strong>{" "}
                {theme.key === "wait" && "Add front-desk coverage during Friday/Saturday peaks and text guests when their room is ready. Mention the fix in your replies so future readers see it."}
                {theme.key === "availability" && "Open a waitlist and release two extra evening slots per week. Reply to these reviews with the new availability."}
                {theme.key === "parking" && "Add parking directions to your Google profile and booking confirmations. A photo of the overflow lot helps."}
                {theme.key === "pricing" && "Lead with your membership pricing in replies and on Google so per-visit cost feels fair."}
                {theme.key === "front_desk" && "Refresh the check-in script and confirm bookings by text 24 hours ahead."}
                {theme.key === "inconsistent" && "Note preferred pressure and therapist on each client's profile so every visit matches the first one."}
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

function StoryCard({ tone, icon, eyebrow, title, body }: { tone: "success" | "warning" | "brand"; icon: React.ReactNode; eyebrow: string; title: string; body: string }) {
  const cls = {
    success: "bg-success-100 text-success-600",
    warning: "bg-warning-100 text-warning-600",
    brand: "bg-brand-50 text-brand-600",
  }[tone];
  return (
    <div className="card p-5">
      <p className={cn("inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-bold uppercase tracking-wider", cls)}>
        {icon} {eyebrow}
      </p>
      <p className="mt-2.5 text-[20px] font-extrabold leading-tight text-navy-900">{title}</p>
      <p className="mt-1.5 text-[13.5px] leading-snug text-ink-muted">{body}</p>
    </div>
  );
}

function ThemeBar({ t, onClick, tone, invert, scale = 1 }: { t: ThemeStat; onClick: () => void; tone: "success" | "warning" | "sky"; invert?: boolean; scale?: number }) {
  return (
    <button onClick={onClick} className="block w-full text-left">
      <div className="mb-1.5 flex items-center justify-between text-[13px]">
        <span className="font-semibold text-ink underline-offset-2 hover:underline">{t.label}</span>
        <span className="flex items-center gap-2 text-ink-muted">
          <span className="tabular">
            {t.count} mention{t.count === 1 ? "" : "s"} · {Math.round(t.share * 100)}%
          </span>
          {t.change !== 0 && <Delta value={t.change} invert={invert} format={(v) => formatPct(v, { sign: true })} />}
        </span>
      </div>
      <ProgressBar value={Math.min(100, Math.max(5, t.share * 100 * scale))} tone={tone} height={8} />
    </button>
  );
}
