"use client";

import { Check, Download, FileText, Mail, Share2, Sparkles, Star } from "lucide-react";
import { useState } from "react";
import { ClientOnly, PageHeader } from "@/components/app/Common";
import { ActionCard } from "@/components/app/ActionCard";
import { ScoreRing } from "@/components/charts/ScoreRing";
import { Badge, Delta } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Logo } from "@/components/ui/Logo";
import { useToast } from "@/components/ui/Toast";
import { scoreCategory } from "@/lib/scoring/reputation";
import { useBusinessData } from "@/lib/hooks/useBusinessData";
import { cn, formatPct } from "@/lib/utils";

export default function ReportsPage() {
  return (
    <ClientOnly>
      <Reports />
    </ClientOnly>
  );
}

function Reports() {
  const d = useBusinessData();
  const { toast } = useToast();
  const [selected, setSelected] = useState(0);
  const r = d.reports[selected];
  const cat = scoreCategory(r.reputationScore);
  const isCurrent = selected === 0;

  const soon = (what: string) => toast({ kind: "info", title: `${what} is queued for production`, description: "PDF export, email delivery and shareable links ship with the live version." });

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="A monthly reputation report you could hand to a partner or manager"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" icon={<Download className="h-4 w-4" />} onClick={() => (typeof window !== "undefined" ? window.print() : soon("PDF export"))}>
              Export PDF
            </Button>
            <Button variant="outline" size="sm" icon={<Mail className="h-4 w-4" />} onClick={() => soon("Email delivery")}>
              Email
            </Button>
            <Button variant="outline" size="sm" icon={<Share2 className="h-4 w-4" />} onClick={() => soon("Shareable link")}>
              Share
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <div className="space-y-2 lg:sticky lg:top-6 lg:self-start">
          <p className="px-1 text-[11px] font-bold uppercase tracking-wider text-ink-subtle">Reports</p>
          {d.reports.map((rep, i) => (
            <button key={rep.id} onClick={() => setSelected(i)} className={cn("flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors", i === selected ? "border-brand-400 bg-brand-50/60" : "border-line bg-white hover:border-line-strong")}>
              <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", i === selected ? "bg-brand-600 text-white" : "bg-canvas text-ink-muted")}>
                <FileText className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-semibold text-ink">{i === 0 ? "Current period" : rep.periodLabel}</span>
                <span className="block text-[12px] text-ink-muted">
                  Score {rep.reputationScore} · {rep.reviewsGained} reviews
                </span>
              </span>
              {i === 0 && <Badge tone="brand">Live</Badge>}
            </button>
          ))}
        </div>

        {/* The report document */}
        <article className="card overflow-hidden print:shadow-none" id="report">
          <div className="border-b border-line bg-gradient-to-br from-white to-brand-50/60 p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <Logo height={40} href={null} />
                <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600">Monthly Reputation Report</p>
                <h2 className="mt-1 text-[24px] font-extrabold tracking-tight text-navy-900 sm:text-[28px]">{d.business.name}</h2>
                <p className="text-[14px] text-ink-muted">
                  {r.periodLabel} · {d.business.address}, {d.business.city}
                </p>
              </div>
              <ScoreRing value={r.reputationScore} size={120} stroke={10} tone={cat.tone} label={cat.label} />
            </div>
            <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-ink">{r.executiveSummary}</p>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <Kpi label="Reputation Score" value={String(r.reputationScore)} delta={r.scoreChange} deltaSuffix=" pts" />
              <Kpi label="Google rating" value={r.googleRating.toFixed(1)} icon={<Star className="h-4 w-4 fill-warning-500 text-warning-500" />} />
              <Kpi label="Reviews gained" value={`+${r.reviewsGained}`} />
              <Kpi label="Review growth" value={formatPct(r.reviewGrowth, { sign: true })} />
              <Kpi label="Response rate" value={`${Math.round(r.responseRate * 100)}%`} />
              <Kpi label="NFC taps" value={String(r.nfcTaps)} delta={r.nfcChange} deltaFormat={(v) => formatPct(v, { sign: true })} />
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <ReportSection title="Top positive themes">
                <ul className="space-y-1.5">
                  {r.topPositiveThemes.map((t) => (
                    <li key={t} className="flex items-center gap-2 text-[14px] text-ink">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-success-100 text-success-600">
                        <Check className="h-3 w-3" />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </ReportSection>
              <ReportSection title="Emerging negative themes">
                {r.emergingNegativeThemes.length === 0 ? (
                  <p className="text-[14px] text-ink-muted">No complaint theme grew this period.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {r.emergingNegativeThemes.map((t) => (
                      <li key={t} className="flex items-center gap-2 text-[14px] text-ink">
                        <span className="h-2 w-2 rounded-full bg-warning-500" /> {t}
                      </li>
                    ))}
                  </ul>
                )}
              </ReportSection>
              <ReportSection title="Competitor movement">
                <p className="text-[14px] leading-relaxed text-ink">{r.competitorSummary}</p>
              </ReportSection>
              <ReportSection title="Actions completed">
                {r.actionsCompleted.length === 0 ? (
                  <p className="text-[14px] text-ink-muted">No actions were completed this period.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {r.actionsCompleted.map((t) => (
                      <li key={t} className="flex items-start gap-2 text-[14px] text-ink">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-success-500" /> {t}
                      </li>
                    ))}
                  </ul>
                )}
              </ReportSection>
            </div>

            <div className="mt-6">
              <p className="mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-ink-subtle">
                <Sparkles className="h-3.5 w-3.5 text-brand-600" /> Recommended next steps
              </p>
              {isCurrent ? (
                d.openActions.length ? (
                  <div className="grid gap-3 md:grid-cols-3">
                    {d.openActions.map((a, i) => (
                      <ActionCard key={a.id} action={a} index={i + 1} />
                    ))}
                  </div>
                ) : (
                  <p className="text-[14px] text-ink-muted">All recommended actions are complete.</p>
                )
              ) : (
                <ol className="space-y-1.5">
                  {r.recommendedNextSteps.map((t, i) => (
                    <li key={t} className="flex items-start gap-2.5 text-[14px] text-ink">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-navy-900 text-[11px] font-bold text-white">{i + 1}</span> {t}
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {isCurrent && d.completedActions.length > 0 && (
              <div className="mt-6">
                <p className="mb-3 text-[12px] font-bold uppercase tracking-wider text-ink-subtle">Recently completed</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {d.completedActions.slice(0, 4).map((a) => (
                    <ActionCard key={a.id} action={a} showUndo={!a.id.startsWith("act_done")} />
                  ))}
                </div>
              </div>
            )}

            <p className="mt-8 border-t border-line pt-4 text-[11.5px] leading-snug text-ink-subtle">
              Prepared by BoostReviews.AI. The Reputation Score and Google Profile Health are proprietary BoostReviews.AI assessments and are not Google metrics. Review data is sourced from the business&apos;s public Google Business Profile.
            </p>
          </div>
        </article>
      </div>
    </>
  );
}

function Kpi({ label, value, delta, deltaSuffix, deltaFormat, icon }: { label: string; value: string; delta?: number; deltaSuffix?: string; deltaFormat?: (v: number) => string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-canvas/60 p-3.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">{label}</p>
      <p className="mt-1 flex items-center gap-1.5 text-[22px] font-extrabold leading-none text-navy-900 tabular">
        {value}
        {icon}
      </p>
      {typeof delta === "number" && <Delta value={delta} suffix={deltaSuffix} format={deltaFormat} className="mt-1.5" />}
    </div>
  );
}

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="shadow-none">
      <CardHeader title={title} className="px-5 pt-4 sm:px-5 sm:pt-4" />
      <CardBody className="px-5 pb-4 pt-2 sm:px-5 sm:pb-4">{children}</CardBody>
    </Card>
  );
}
