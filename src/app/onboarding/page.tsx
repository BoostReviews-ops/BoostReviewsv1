"use client";

import { ArrowRight, Building2, Check, CreditCard, Globe, LayoutDashboard, Link2, Nfc, Search, ShieldCheck, Sparkles, UserPlus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Logo } from "@/components/ui/Logo";
import { PLANS } from "@/lib/billing/plans";
import { cn, formatCurrency } from "@/lib/utils";

const STEPS = [
  { key: "account", label: "Create account", icon: UserPlus },
  { key: "business", label: "Business info", icon: Building2 },
  { key: "google", label: "Find your Google profile", icon: Search },
  { key: "authorize", label: "Authorize Google", icon: ShieldCheck },
  { key: "destination", label: "Review destination", icon: Link2 },
  { key: "card", label: "NFC / QR redirect", icon: Nfc },
  { key: "plan", label: "Choose a plan", icon: CreditCard },
  { key: "done", label: "Dashboard", icon: LayoutDashboard },
];

/**
 * Future-ready onboarding flow. Every step renders today so the journey can be
 * shown to a prospect; production wiring (Supabase auth, Google OAuth, Stripe
 * Checkout) hooks into the same steps. "Explore live demo" skips all of it.
 */
const STATIC = process.env.NEXT_PUBLIC_STATIC_DEMO === "1";

export default function OnboardingPage() {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState("growth");
  const [form, setForm] = useState({ name: "", email: "", business: "", phone: "", website: "", dest: "google" });
  const [creating, setCreating] = useState(false);
  const next = async () => {
    if (STEPS[step].key === "plan" && process.env.NEXT_PUBLIC_SUPABASE_URL && !STATIC) {
      setCreating(true);
      try {
        const res = await fetch("/api/onboarding", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ businessName: form.business || "My Business", phone: form.phone, website: form.website }) });
        const json = (await res.json()) as { ok?: boolean; error?: string; mode?: string };
        if (res.status === 401) {
          toast({ kind: "info", title: "Sign in first", description: "Use the email link, then come back to finish setup." });
          window.location.href = "/login?next=/onboarding";
          return;
        }
        if (!res.ok || json.error) throw new Error(json.error ?? "Could not create the business");
        document.cookie = "br_demo=; path=/; max-age=0";
      } catch (e) {
        toast({ kind: "error", title: "Setup failed", description: (e as Error).message });
        setCreating(false);
        return;
      }
      setCreating(false);
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };
  const back = () => setStep((s) => Math.max(0, s - 1));
  const current = STEPS[step];

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-[72px] max-w-5xl items-center justify-between px-4 sm:px-6">
          <span className="sm:hidden"><Logo height={36} priority /></span>
          <span className="hidden sm:inline"><Logo height={46} priority /></span>
          <Button size="sm" variant="secondary" href="/demo" iconRight={<ArrowRight className="h-4 w-4" />}>
            Explore live demo
          </Button>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-5xl flex-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[260px_1fr] lg:py-12">
        {/* Stepper */}
        <ol className="flex gap-2 overflow-x-auto scrollbar-none lg:flex-col lg:gap-1" aria-label="Onboarding steps">
          {STEPS.map((s, i) => {
            const state = i < step ? "done" : i === step ? "current" : "todo";
            return (
              <li key={s.key} className="shrink-0">
                <button onClick={() => i <= step && setStep(i)} className={cn("flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13.5px] font-semibold", state === "current" ? "bg-white text-brand-700 shadow-[var(--shadow-card)]" : state === "done" ? "text-ink" : "text-ink-subtle")}>
                  <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", state === "done" ? "bg-success-100 text-success-600" : state === "current" ? "bg-brand-600 text-white" : "bg-line text-ink-subtle")}>{state === "done" ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}</span>
                  <span className="hidden lg:inline">{s.label}</span>
                  <span className="lg:hidden">{i + 1}</span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* Step content */}
        <section className="card p-6 sm:p-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600">
            Step {step + 1} of {STEPS.length}
          </p>
          <h1 className="mt-1.5 text-[24px] font-extrabold tracking-tight text-navy-900 sm:text-[28px]">{current.label}</h1>
          {step === 0 && (
            <p className="mt-3 inline-flex items-center gap-2 rounded-xl bg-sky-100 px-3 py-2 text-[12.5px] font-medium text-brand-700">
              <Sparkles className="h-3.5 w-3.5" /> Preview of the setup flow. Live accounts open at launch — nothing is saved here yet.
            </p>
          )}

          {current.key === "account" && (
            <div className="mt-6 max-w-md space-y-3">
              <p className="text-[14.5px] text-ink-muted">Create your BoostReviewsAI account. In production this uses secure email or Google sign-in.</p>
              <Field label="Your name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Alexis Romero" />
              <Field label="Work email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="owner@yourbusiness.com" type="email" />
              <div className="rounded-xl bg-canvas p-3 text-[12.5px] text-ink-muted">Just looking? <a href="/demo" className="font-semibold text-brand-600">Explore the live demo</a> — no account required.</div>
            </div>
          )}

          {current.key === "business" && (
            <div className="mt-6 max-w-md space-y-3">
              <Field label="Business name" value={form.business} onChange={(v) => setForm({ ...form, business: v })} placeholder="Royal Massage & Spa" />
              <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="(512) 555-0148" />
              <Field label="Website (optional)" value={form.website} onChange={(v) => setForm({ ...form, website: v })} placeholder="https://" />
            </div>
          )}

          {current.key === "google" && (
            <div className="mt-6 space-y-3">
              <p className="text-[14.5px] text-ink-muted">We&apos;ll find your Google Business Profile so reviews and ratings sync automatically.</p>
              <div className="relative max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
                <input defaultValue={form.business || "Royal Massage & Spa, Austin"} className="h-11 w-full rounded-xl border border-line bg-white pl-9 pr-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" aria-label="Search Google Business Profiles" />
              </div>
              <div className="max-w-md divide-y divide-line rounded-2xl border border-line bg-white">
                {[
                  { n: "Royal Massage & Spa", a: "1420 Westgate Blvd, Suite 110, Austin, TX", r: "4.8 · 426 reviews", sel: true },
                  { n: "Royal Massage & Spa — North", a: "8900 Research Blvd, Austin, TX", r: "4.6 · 112 reviews" },
                ].map((p) => (
                  <div key={p.n} className={cn("flex items-center gap-3 p-3.5", p.sel && "bg-brand-50/60")}>
                    <Globe className="h-5 w-5 shrink-0 text-brand-600" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold text-ink">{p.n}</p>
                      <p className="truncate text-[12px] text-ink-muted">{p.a} · {p.r}</p>
                    </div>
                    {p.sel && <Check className="h-4 w-4 text-brand-600" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {current.key === "authorize" && (
            <div className="mt-6 max-w-md space-y-4">
              <p className="text-[14.5px] text-ink-muted">Authorize BoostReviewsAI to read your reviews and publish replies you approve. We only request the Business Profile scope Google requires, and you can revoke access any time.</p>
              <div className="rounded-2xl border border-line bg-white p-4">
                <p className="text-[13px] font-semibold text-ink">BoostReviewsAI will be able to:</p>
                <ul className="mt-2 space-y-1.5 text-[13.5px] text-ink-muted">
                  {["See your business information and locations", "See your reviews and ratings", "Publish review replies that you approve", "Nothing is posted automatically"].map((t) => (
                    <li key={t} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success-500" /> {t}
                    </li>
                  ))}
                </ul>
              </div>
              {STATIC ? (
                <Button variant="outline" icon={<ShieldCheck className="h-4 w-4" />} onClick={() => toast({ kind: "info", title: "Google connection opens at launch", description: "This preview runs on seeded demo data. Continue to see the rest of the flow." })}>
                  Continue with Google
                </Button>
              ) : (
                <Button variant="outline" href="/api/google/oauth/start" icon={<ShieldCheck className="h-4 w-4" />}>
                  Continue with Google
                </Button>
              )}
              <p className="text-[12px] text-ink-subtle">Live Google connections open with the production launch. Continue to preview the rest of the flow.</p>
            </div>
          )}

          {current.key === "destination" && (
            <div className="mt-6 max-w-md space-y-3">
              <p className="text-[14.5px] text-ink-muted">Where should customers land when they tap your card?</p>
              {[
                { v: "google", t: "Google review page", d: "Recommended. Opens the review box directly." },
                { v: "custom", t: "Custom link", d: "A promotion, booking page or feedback form." },
              ].map((o) => (
                <button key={o.v} onClick={() => setForm({ ...form, dest: o.v })} className={cn("flex w-full items-start gap-3 rounded-2xl border bg-white p-4 text-left", form.dest === o.v ? "border-brand-400 ring-2 ring-brand-100" : "border-line")}>
                  <span className={cn("mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2", form.dest === o.v ? "border-brand-600 bg-brand-600 text-white" : "border-line-strong")}>{form.dest === o.v && <Check className="h-3 w-3" />}</span>
                  <span>
                    <span className="block text-[14px] font-semibold text-ink">{o.t}</span>
                    <span className="block text-[12.5px] text-ink-muted">{o.d}</span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {current.key === "card" && (
            <div className="mt-6 max-w-md space-y-4">
              <p className="text-[14.5px] text-ink-muted">Your permanent redirect link is generated now and programmed onto the NFC card we ship you. Change the destination any time from the dashboard — the card never needs reprogramming.</p>
              <div className="rounded-2xl gradient-brand p-5 text-white">
                <p className="text-[11px] font-bold uppercase tracking-wider text-sky-300">Your card link</p>
                <p className="mt-1 font-mono text-[15px]">boostreviewsai.com/r/{(form.business || "your-business").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}</p>
                <p className="mt-3 text-[12.5px] text-white/80">Ships in 3–5 business days with a countertop stand and a matching QR card.</p>
              </div>
            </div>
          )}

          {current.key === "plan" && (
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {PLANS.map((p) => (
                <button key={p.id} onClick={() => setPlan(p.id)} className={cn("flex flex-col rounded-2xl border bg-white p-4 text-left", plan === p.id ? "border-brand-400 ring-2 ring-brand-100" : "border-line")}>
                  <p className="text-[16px] font-extrabold text-navy-900">{p.name}</p>
                  <p className="text-[12.5px] text-ink-muted">{p.tagline}</p>
                  <p className="mt-2 text-[22px] font-extrabold text-navy-900 tabular">
                    {formatCurrency(p.priceMonthly)}
                    <span className="text-xs font-medium text-ink-subtle">/mo</span>
                  </p>
                  <ul className="mt-3 space-y-1 text-[12.5px] text-ink">
                    {p.features.slice(0, 3).map((f) => (
                      <li key={f} className="flex gap-1.5">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" /> {f}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
              <p className="text-[12px] text-ink-subtle md:col-span-3">Payment is collected through Stripe Checkout in production. No card is required to explore the demo.</p>
            </div>
          )}

          {current.key === "done" && (
            <div className="mt-6 max-w-md">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success-100 text-success-600">
                <Sparkles className="h-7 w-7" />
              </div>
              <p className="mt-4 text-[16px] font-semibold text-ink">You&apos;re set up.</p>
              <p className="mt-1 text-[14.5px] text-ink-muted">In production your dashboard fills with real Google data within a few minutes. For now, jump into the fully populated demo account.</p>
              <Button className="mt-5" href="/app" size="lg" iconRight={<ArrowRight className="h-5 w-5" />}>
                Open the dashboard
              </Button>
            </div>
          )}

          {current.key !== "done" && (
            <div className="mt-8 flex items-center justify-between border-t border-line pt-5">
              <Button variant="ghost" onClick={back} disabled={step === 0}>
                Back
              </Button>
              <Button onClick={next} loading={creating} iconRight={<ArrowRight className="h-4 w-4" />}>
                Continue
              </Button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-semibold text-ink-muted">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-11 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
    </label>
  );
}
