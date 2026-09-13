"use client";

import { ArrowRight, Check, ChevronLeft, ChevronRight, FileText, Globe, MessageSquareText, Nfc, Sparkles, Star, TrendingUp, Users, AlertTriangle, WandSparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ScoreRing, MiniRing } from "@/components/charts/ScoreRing";
import { cn } from "@/lib/utils";

interface Feature {
  key: string;
  icon: React.ReactNode;
  title: string;
  short: string;
  answer: string;
  href: string;
  cta: string;
}

const FEATURES: Feature[] = [
  { key: "score", icon: <Star className="h-5 w-5" />, title: "Reputation Score", short: "One number for your whole reputation", answer: "How strong is my reputation, and is it improving?", href: "/app", cta: "See the live score" },
  { key: "nfc", icon: <Nfc className="h-5 w-5" />, title: "NFC review card", short: "Tap to review, at the counter", answer: "How do I get more reviews without asking awkwardly?", href: "/app/review-card", cta: "See card analytics" },
  { key: "ai", icon: <MessageSquareText className="h-5 w-5" />, title: "AI-assisted replies", short: "Personal replies, drafted for you", answer: "Am I responding to customers fast enough?", href: "/app/reviews?filter=unanswered", cta: "Try an AI reply" },
  { key: "themes", icon: <Sparkles className="h-5 w-5" />, title: "Sentiment & themes", short: "What customers actually say", answer: "What do customers love, and what problems keep appearing?", href: "/app/insights", cta: "See customer themes" },
  { key: "competitors", icon: <Users className="h-5 w-5" />, title: "Competitor intelligence", short: "Know where you stand nearby", answer: "How do I compare with the businesses down the street?", href: "/app/competitors", cta: "See the ranking" },
  { key: "profile", icon: <Globe className="h-5 w-5" />, title: "Google Profile Health", short: "A checklist for your listing", answer: "Is my Google Business Profile working for me?", href: "/app/google-profile", cta: "See profile health" },
  { key: "report", icon: <FileText className="h-5 w-5" />, title: "Monthly report", short: "Progress you can share", answer: "What should I do this week, and what did we get done?", href: "/app/reports", cta: "Open the report" },
];

const AI_DRAFT = "Priya, we're truly sorry about your experience. A delay like that is not acceptable, and cutting into your session time is not how we operate. We've changed our scheduling so appointments start on time. Our manager would like to make this right — please call us and your next session is on us.";

export function FeatureExplorer() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const chipsRef = useRef<HTMLDivElement>(null);

  // Auto-rotate until the visitor interacts.
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActive((a) => (a + 1) % FEATURES.length), 5200);
    return () => clearInterval(t);
  }, [paused]);

  // Keep the active chip visible on mobile.
  useEffect(() => {
    // Scroll the chip strip horizontally only — never the page.
    const wrap = chipsRef.current;
    const el = wrap?.children[active] as HTMLElement | undefined;
    if (!wrap || !el || wrap.scrollWidth <= wrap.clientWidth) return;
    wrap.scrollTo({ left: el.offsetLeft - (wrap.clientWidth - el.offsetWidth) / 2, behavior: "smooth" });
  }, [active]);

  const select = (i: number) => {
    setPaused(true);
    setActive(((i % FEATURES.length) + FEATURES.length) % FEATURES.length);
  };
  const f = FEATURES[active];

  return (
    <div className="mt-10 grid gap-5 lg:grid-cols-[360px_1fr] lg:gap-8">
      {/* Feature list — chips on mobile, vertical list on desktop */}
      <div ref={chipsRef} className="flex snap-x gap-2 overflow-x-auto pb-1 scrollbar-none lg:flex-col lg:overflow-visible lg:pb-0" role="tablist" aria-label="Features">
        {FEATURES.map((ft, i) => {
          const on = i === active;
          return (
            <button
              key={ft.key}
              role="tab"
              aria-selected={on}
              onClick={() => select(i)}
              className={cn(
                "flex shrink-0 snap-center items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-all lg:w-full",
                on ? "border-sky-300/60 bg-white text-navy-900 shadow-[0_12px_32px_-12px_rgba(62,197,247,0.6)]" : "border-white/10 bg-white/5 text-white hover:bg-white/10",
              )}
            >
              <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", on ? "gradient-brand text-white" : "bg-white/10 text-sky-300")}>{ft.icon}</span>
              <span className="min-w-0">
                <span className="block whitespace-nowrap text-[14px] font-bold lg:whitespace-normal">{ft.title}</span>
                <span className={cn("hidden text-[12.5px] lg:block", on ? "text-ink-muted" : "text-white/60")}>{ft.short}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Preview */}
      <div className="relative">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white text-ink shadow-[var(--shadow-pop)]">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">{f.icon}</span>
              <div className="min-w-0">
                <p className="truncate text-[14px] font-bold text-navy-900">{f.title}</p>
                <p className="text-[12px] leading-snug text-ink-muted">Answers: “{f.answer}”</p>
              </div>
            </div>
            <div className="hidden items-center gap-1 sm:flex">
              <button onClick={() => select(active - 1)} className="rounded-lg p-1.5 text-ink-subtle hover:bg-canvas hover:text-ink" aria-label="Previous feature">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => select(active + 1)} className="rounded-lg p-1.5 text-ink-subtle hover:bg-canvas hover:text-ink" aria-label="Next feature">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div key={f.key} className="min-h-[300px] p-5 animate-fade-up sm:p-6" onPointerDown={() => setPaused(true)}>
            {f.key === "score" && <ScorePreview />}
            {f.key === "nfc" && <NfcPreview />}
            {f.key === "ai" && <AiPreview />}
            {f.key === "themes" && <ThemesPreview />}
            {f.key === "competitors" && <CompetitorsPreview />}
            {f.key === "profile" && <ProfilePreview />}
            {f.key === "report" && <ReportPreview />}
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-line bg-canvas/60 px-5 py-3">
            <div className="flex items-center gap-1.5" aria-hidden>
              {FEATURES.map((ft, i) => (
                <button key={ft.key} onClick={() => select(i)} className={cn("h-1.5 rounded-full transition-all", i === active ? "w-6 bg-brand-600" : "w-1.5 bg-line-strong")} aria-label={`Show ${ft.title}`} />
              ))}
            </div>
            <Link href={f.href} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-600 hover:underline">
              {f.cta} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- previews (real demo numbers, hand-tuned) ---------------- */

function Story({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 rounded-xl bg-brand-50/70 px-3.5 py-2.5 text-[13px] leading-snug text-navy-900">{children}</p>;
}

function ScorePreview() {
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-7">
      <ScoreRing value={87} size={150} stroke={12} tone="strong" label="Strong" sublabel="out of 100" />
      <div className="flex-1 text-center sm:text-left">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-600">BoostReviewsAI Reputation Score</p>
        <p className="mt-1 text-[22px] font-extrabold leading-tight text-navy-900">
          Your reputation is <span className="text-gradient-brand">strong</span>
        </p>
        <p className="mt-1 inline-flex items-center gap-1 rounded-md bg-success-100 px-1.5 py-0.5 text-[12px] font-semibold text-success-600">
          <TrendingUp className="h-3.5 w-3.5" /> +6 points this month
        </p>
        <ul className="mt-3 space-y-1.5 text-[13px] text-ink">
          {[["+4", "Strong review growth", true], ["+1", "Improved response rate", true], ["+1", "Better recent sentiment", true], ["−1", "Competitor gaining reviews faster", false]].map(([p, l, good]) => (
            <li key={l as string} className="flex items-center justify-center gap-2 sm:justify-start">
              <span className={cn("w-8 rounded-md px-1 text-center text-[11px] font-bold", good ? "bg-success-100 text-success-600" : "bg-danger-100 text-danger-600")}>{p}</span> {l}
            </li>
          ))}
        </ul>
        <Story>Nine signals, one number. You always see exactly why it moved.</Story>
      </div>
    </div>
  );
}

function NfcPreview() {
  const [taps, setTaps] = useState(0);
  useEffect(() => {
    let n = 0;
    const t = setInterval(() => {
      n += 7;
      if (n >= 188) {
        n = 188;
        clearInterval(t);
      }
      setTaps(n);
    }, 40);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="grid gap-5 sm:grid-cols-[190px_1fr] sm:items-center">
      <div className="mx-auto aspect-[1.586] w-full max-w-[190px] rounded-2xl gradient-brand p-4 text-white shadow-[var(--shadow-pop)]">
        <div className="flex items-center justify-between">
          <Nfc className="h-6 w-6" />
          <span className="h-2 w-2 rounded-full bg-success-500 shadow-[0_0_0_4px_rgba(22,163,74,0.25)]" />
        </div>
        <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300">Tap to review us</p>
        <p className="text-[14px] font-bold">Royal Massage &amp; Spa</p>
      </div>
      <div>
        <p className="text-[34px] font-extrabold leading-none text-navy-900 tabular">{taps} <span className="text-base font-semibold text-ink-muted">taps this month</span></p>
        <p className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-success-100 px-1.5 py-0.5 text-[12px] font-semibold text-success-600">
          <TrendingUp className="h-3.5 w-3.5" /> +18% vs last month
        </p>
        <div className="mt-3 flex items-end gap-1">
          {[36, 39, 41, 44, 43, 47, 51, 56].map((v, i, a) => (
            <span key={i} className={cn("flex-1 rounded-sm", i === a.length - 1 ? "bg-sky-400" : "bg-brand-100")} style={{ height: 8 + (v / 56) * 36 }} />
          ))}
        </div>
        <Story>The chip points to a link you control. Change where taps go any time, no reprogramming.</Story>
      </div>
    </div>
  );
}

function AiPreview() {
  const [typed, setTyped] = useState("");
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const kick = setTimeout(() => setStarted(true), 700);
    return () => clearTimeout(kick);
  }, []);
  useEffect(() => {
    if (!started) return;
    let i = 0;
    const t = setInterval(() => {
      i += 3;
      setTyped(AI_DRAFT.slice(0, i));
      if (i >= AI_DRAFT.length) clearInterval(t);
    }, 22);
    return () => clearInterval(t);
  }, [started]);
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-line p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-warning-100 text-[11px] font-bold text-warning-600">PP</span>
          <div>
            <p className="text-[13px] font-semibold text-ink">Priya P.</p>
            <p className="text-[11px] text-ink-subtle">2 stars · 3 weeks ago</p>
          </div>
          <span className="ml-auto rounded-full bg-warning-100 px-2 py-0.5 text-[11px] font-semibold text-warning-600">Needs reply</span>
        </div>
        <p className="mt-3 text-[13px] leading-snug text-ink-muted">Waited over 30 minutes for a 60-minute appointment and only got 45 minutes on the table. Not okay for what they charge.</p>
      </div>
      <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-4">
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-700">
          <WandSparkles className="h-3.5 w-3.5" /> AI-drafted reply
        </p>
        <p className="mt-2 min-h-[96px] text-[13px] leading-snug text-ink">
          {typed}
          {typed.length < AI_DRAFT.length && <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse-soft bg-brand-600 align-middle" />}
        </p>
        <div className="mt-3 flex gap-2">
          <span className="inline-flex h-8 items-center rounded-lg bg-brand-600 px-3 text-[12px] font-semibold text-white">Approve &amp; submit</span>
          <span className="inline-flex h-8 items-center rounded-lg border border-line bg-white px-3 text-[12px] font-semibold text-ink">Edit</span>
        </div>
      </div>
      <div className="sm:col-span-2">
        <Story>It reads the review and names the fix. You approve every word before anything is published.</Story>
      </div>
    </div>
  );
}

function ThemesPreview() {
  const [go, setGo] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGo(true), 150);
    return () => clearTimeout(t);
  }, []);
  const rows = [
    ["Massage quality", 52, "success"],
    ["Staff friendliness", 33, "success"],
    ["Atmosphere", 23, "success"],
    ["Cleanliness", 12, "success"],
  ] as const;
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-success-600">Customers love</p>
        <ul className="mt-2 space-y-2.5">
          {rows.map(([label, pct]) => (
            <li key={label}>
              <div className="mb-1 flex justify-between text-[13px]">
                <span className="font-semibold text-ink">{label}</span>
                <span className="text-ink-muted tabular">{pct}% of reviews</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-canvas ring-1 ring-inset ring-line">
                <div className="h-full rounded-full bg-success-500 transition-all duration-1000 ease-out" style={{ width: go ? `${pct}%` : 0 }} />
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-warning-600">One issue is emerging</p>
        <div className="mt-2 rounded-2xl border border-warning-100 bg-warning-100/40 p-4">
          <p className="flex items-center gap-2 text-[15px] font-bold text-navy-900">
            <AlertTriangle className="h-4 w-4 text-warning-600" /> Wait times
          </p>
          <p className="mt-1 text-[13px] text-ink-muted">Negative mentions rose <strong className="text-warning-600">75%</strong> over the last 90 days (7 mentions).</p>
          <p className="mt-2 text-[12.5px] text-ink">Suggested fix: add front-desk coverage on Friday and Saturday peaks.</p>
        </div>
        <Story>You don&apos;t read 400 reviews. You read four lines.</Story>
      </div>
    </div>
  );
}

function CompetitorsPreview() {
  const rows = [
    ["Serenity Spa & Wellness", 38, 4.6, false],
    ["Royal Massage & Spa", 31, 4.8, true],
    ["Elements Massage", 27, 4.4, false],
    ["The Knot Studio", 24, 4.7, false],
    ["Tranquil Touch", 19, 4.5, false],
  ] as const;
  return (
    <div>
      <p className="text-[18px] font-extrabold text-navy-900">You rank #2 of 6 for review growth</p>
      <p className="text-[13px] text-ink-muted">Reviews gained this month · you have the highest rating in the area</p>
      <ul className="mt-3 space-y-2">
        {rows.map(([name, n, r, you], i) => (
          <li key={name} className={cn("flex items-center gap-3 rounded-xl px-2 py-1.5", you && "bg-brand-50")}>
            <span className={cn("w-6 text-center text-[12px] font-bold tabular", i === 0 ? "text-navy-900" : "text-ink-subtle")}>#{i + 1}</span>
            <span className="w-[38%] truncate text-[13px] font-semibold text-ink">{you ? "You" : name}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-canvas ring-1 ring-inset ring-line">
              <div className={cn("h-full rounded-full", you ? "bg-brand-600" : "bg-sky-300")} style={{ width: `${(n / 38) * 100}%` }} />
            </div>
            <span className="w-8 text-right text-[13px] font-bold text-navy-900 tabular">+{n}</span>
            <span className="hidden w-10 items-center gap-0.5 text-[12px] text-ink-muted sm:inline-flex">
              <Star className="h-3 w-3 fill-warning-500 text-warning-500" /> {r}
            </span>
          </li>
        ))}
      </ul>
      <Story>Serenity gained 7 more reviews than you this month. About 8 extra review requests a week closes the gap.</Story>
    </div>
  );
}

function ProfilePreview() {
  const checks = [
    ["Hours complete", "pass"],
    ["Services listed", "pass"],
    ["Strong review velocity", "pass"],
    ["Rating trend steady", "pass"],
    ["5 reviews need responses", "warn"],
    ["New photos recommended", "warn"],
  ] as const;
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:gap-7">
      <div className="text-center">
        <MiniRing value={91} size={120} stroke={10} tone="excellent" />
        <p className="mt-2 text-[12px] font-bold uppercase tracking-wider text-success-600">Excellent</p>
      </div>
      <div className="w-full flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600">Google Profile Health</p>
        <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {checks.map(([label, s]) => (
            <li key={label} className="flex items-center gap-2 text-[13px] text-ink">
              <span className={cn("flex h-5 w-5 items-center justify-center rounded-md", s === "pass" ? "bg-success-100 text-success-600" : "bg-warning-100 text-warning-600")}>{s === "pass" ? <Check className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}</span>
              {label}
            </li>
          ))}
        </ul>
        <Story>Two fixes this week would add up to 9 points. We tell you which ones.</Story>
      </div>
    </div>
  );
}

function ReportPreview() {
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600">Monthly Reputation Report</p>
          <p className="text-[18px] font-extrabold text-navy-900">Royal Massage &amp; Spa</p>
          <p className="text-[12px] text-ink-muted">Aug 14 – Sep 13</p>
        </div>
        <MiniRing value={87} size={56} stroke={6} tone="strong" />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[["Reviews", "+31", "+22%"], ["Response rate", "94%", "+3 pts"], ["NFC taps", "188", "+18%"]].map(([l, v, d]) => (
          <div key={l} className="rounded-xl border border-line bg-canvas/60 p-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-subtle">{l}</p>
            <p className="text-[18px] font-extrabold leading-none text-navy-900 tabular">{v}</p>
            <p className="mt-1 text-[11px] font-semibold text-success-600">{d}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-line p-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-subtle">Done this month</p>
          <ul className="mt-1.5 space-y-1 text-[12.5px] text-ink">
            <li className="flex gap-1.5"><Check className="mt-0.5 h-3.5 w-3.5 text-success-500" /> Moved review stand to checkout</li>
            <li className="flex gap-1.5"><Check className="mt-0.5 h-3.5 w-3.5 text-success-500" /> Responded to 4 reviews</li>
          </ul>
        </div>
        <div className="rounded-xl border border-line p-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-subtle">Next best moves</p>
          <ol className="mt-1.5 space-y-1 text-[12.5px] text-ink">
            <li className="flex gap-1.5"><span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-navy-900 text-[10px] font-bold text-white">1</span> Respond to 5 unanswered reviews</li>
            <li className="flex gap-1.5"><span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-navy-900 text-[10px] font-bold text-white">2</span> Upload recent business photos</li>
          </ol>
        </div>
      </div>
      <Story>Share it with a partner or manager. Score, trend, what got done, what&apos;s next.</Story>
    </div>
  );
}
