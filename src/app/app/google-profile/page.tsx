"use client";

import { AlertTriangle, Check, ChevronRight, Globe, Info, XCircle, Camera, Link2 } from "lucide-react";
import Link from "next/link";
import { ClientOnly, PageHeader } from "@/components/app/Common";
import { ScoreRing } from "@/components/charts/ScoreRing";
import { AreaTrend } from "@/components/charts/Trend";
import { Badge, Delta } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { useBusinessData } from "@/lib/hooks/useBusinessData";
import { cn } from "@/lib/utils";

export default function GoogleProfilePage() {
  return (
    <ClientOnly>
      <Profile />
    </ClientOnly>
  );
}

function Profile() {
  const d = useBusinessData();
  const h = d.health;
  const prev = d.healthHistory[d.healthHistory.length - 5]?.score ?? h.score;
  const history = [...d.healthHistory.slice(0, -1), { date: d.healthHistory[d.healthHistory.length - 1].date, score: h.score }].map((s) => ({ label: new Date(`${s.date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }), score: s.score }));
  const passing = h.checks.filter((c) => c.status === "pass");
  const issues = h.checks.filter((c) => c.status !== "pass");

  return (
    <>
      <PageHeader title="Google Profile" subtitle="How well-maintained your Google Business Profile is, and what to fix" />

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card className="relative overflow-hidden">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-sky-100/70 blur-3xl" />
          <div className="relative flex flex-col items-center gap-5 p-6 sm:flex-row sm:gap-7">
            <ScoreRing value={h.score} size={168} stroke={13} tone={h.category.tone} label={h.category.label} sublabel="out of 100" />
            <div className="text-center sm:text-left">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600">Google Profile Health</p>
              <h2 className="mt-1.5 text-[24px] font-extrabold leading-tight tracking-tight text-navy-900">Your profile is {h.category.label.toLowerCase()}</h2>
              <div className="mt-2 flex items-center justify-center gap-2 sm:justify-start">
                <Delta value={h.score - prev} suffix=" pts" />
                <span className="text-[13px] text-ink-muted">vs 30 days ago</span>
              </div>
              <p className="mt-3 text-[13.5px] text-ink-muted">
                {passing.length} of {h.checks.length} checks passing. {issues.length > 0 ? `Fixing ${issues.length === 1 ? "the remaining item" : `the ${issues.length} remaining items`} could add up to ${issues.reduce((a, c) => a + (c.maxPoints - c.points), 0)} points.` : "Everything looks great."}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                <Button size="sm" variant="outline" href="https://business.google.com" icon={<Link2 className="h-4 w-4" />}>
                  Open Google Business Profile
                </Button>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Health over time" subtitle="Weekly · last 26 weeks" />
          <CardBody className="pt-3">
            <AreaTrend data={history} dataKey="score" name="Health" height={190} domain={[70, 100]} color="#14b1ef" />
          </CardBody>
        </Card>
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Needs attention" subtitle="Ordered by points you'd gain" icon={<AlertTriangle className="h-4 w-4" />} />
          <CardBody className="pt-2">
            {issues.length === 0 ? (
              <p className="text-sm text-ink-muted">Nothing to fix right now.</p>
            ) : (
              <ul className="divide-y divide-line">
                {[...issues]
                  .sort((a, b) => b.maxPoints - b.points - (a.maxPoints - a.points))
                  .map((c) => (
                    <li key={c.key}>
                      <CheckRow c={c} />
                    </li>
                  ))}
              </ul>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Passing" subtitle="Keep these up" icon={<Check className="h-4 w-4" />} />
          <CardBody className="pt-2">
            <ul className="divide-y divide-line">
              {passing.map((c) => (
                <li key={c.key}>
                  <CheckRow c={c} />
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title="Photo freshness" subtitle="Profiles with recent photos get more calls and direction requests" icon={<Camera className="h-4 w-4" />} />
          <CardBody className="pt-3">
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={cn("aspect-square rounded-xl", i < 3 ? "bg-gradient-to-br from-brand-100 to-sky-100" : "flex items-center justify-center border-2 border-dashed border-line-strong text-ink-subtle")}>
                  {i === 3 && <Camera className="h-5 w-5" />}
                </div>
              ))}
            </div>
            <p className="mt-3 text-[13.5px] text-ink-muted">Your last photo upload was 47 days ago. Add 3–5 photos of treatment rooms, the lobby and your team this week.</p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Profile snapshot" subtitle="What Google shows customers" icon={<Globe className="h-4 w-4" />} />
          <CardBody className="pt-3">
            <dl className="space-y-2 text-[13.5px]">
              {[
                ["Name", d.business.name],
                ["Category", d.business.category],
                ["Address", `${d.business.address}, ${d.business.city}`],
                ["Phone", d.business.phone],
                ["Website", d.business.website.replace("https://", "")],
                ["Hours", "Mon–Sat 9am–8pm · Sun 10am–6pm"],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-3">
                  <dt className="w-20 shrink-0 text-ink-subtle">{k}</dt>
                  <dd className="min-w-0 flex-1 truncate font-medium text-ink">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-canvas p-3 text-[12px] leading-snug text-ink-muted">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
              Google Profile Health is a BoostReviewsAI assessment based on your profile&apos;s completeness and activity. It is not a Google metric and is not endorsed by Google.
            </p>
          </CardBody>
        </Card>
      </section>
    </>
  );
}

function CheckRow({ c }: { c: ReturnType<typeof useBusinessData>["health"]["checks"][number] }) {
  const icon = c.status === "pass" ? <Check className="h-4 w-4" /> : c.status === "warn" ? <AlertTriangle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />;
  const cls = c.status === "pass" ? "bg-success-100 text-success-600" : c.status === "warn" ? "bg-warning-100 text-warning-600" : "bg-danger-100 text-danger-600";
  const inner = (
    <>
      <span className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", cls)}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-[14px] font-semibold text-ink">{c.label}</span>
          <Badge tone={c.status === "pass" ? "success" : "warning"}>
            {c.points}/{c.maxPoints} pts
          </Badge>
        </span>
        <span className="mt-0.5 block text-[13px] text-ink-muted">{c.detail}</span>
      </span>
      {c.href && <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-ink-subtle" />}
    </>
  );
  if (c.href)
    return (
      <Link href={c.href} className="-mx-2 flex items-start gap-3 rounded-xl px-2 py-3 hover:bg-canvas">
        {inner}
      </Link>
    );
  return <div className="-mx-2 flex items-start gap-3 px-2 py-3">{inner}</div>;
}
