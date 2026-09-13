import { ArrowRight, BarChart3, Check, MessageSquareText, Nfc, Sparkles, Star, Users, Zap, Globe, FileText, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { HeroPreview } from "@/components/landing/HeroPreview";

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-line/70 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo height={30} priority />
          <nav className="hidden items-center gap-7 text-[14px] font-medium text-ink-muted md:flex" aria-label="Primary">
            <a href="#how" className="hover:text-ink">How it works</a>
            <a href="#features" className="hover:text-ink">What you get</a>
            <a href="#pricing" className="hover:text-ink">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" href="/login" className="hidden sm:inline-flex">
              Sign in
            </Button>
            <Button size="sm" href="/demo" iconRight={<ArrowRight className="h-4 w-4" />}>
              Explore live demo
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 gradient-brand-soft" />
        <div className="pointer-events-none absolute -right-40 top-10 h-[480px] w-[480px] rounded-full bg-sky-100/80 blur-3xl" />
        <div className="pointer-events-none absolute -left-40 bottom-0 h-[360px] w-[360px] rounded-full bg-brand-100/60 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pb-24 lg:pt-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white px-3 py-1 text-[12px] font-semibold text-brand-700 shadow-[var(--shadow-card)]">
              <Nfc className="h-3.5 w-3.5" /> NFC review card + reputation intelligence for local businesses
            </span>
            <h1 className="mt-5 text-[38px] font-extrabold leading-[1.05] tracking-tight text-navy-900 sm:text-[52px] lg:text-[60px]">
              Get more reviews.
              <br />
              <span className="text-gradient-brand">Understand your reputation.</span>
              <br />
              Know what to do next.
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-ink-muted">
              Customers tap the BoostReviews.AI card at your front desk and land on your Google review page. Then we turn every review, response and competitor move into one clear score — and tell you exactly what to do this week.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" href="/demo" iconRight={<ArrowRight className="h-5 w-5" />}>
                Explore live demo
              </Button>
              <Button size="lg" variant="outline" href="/onboarding">
                Get BoostReviews.AI
              </Button>
            </div>
            <p className="mt-3 text-[13px] text-ink-subtle">No account needed for the demo. See a real business dashboard in 10 seconds.</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] font-medium text-ink-muted">
              {["Works with any Google Business Profile", "Set up in one visit", "Cancel anytime"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-success-500" /> {t}
                </span>
              ))}
            </div>
          </div>
          <HeroPreview />
        </div>
      </section>

      {/* Fitness tracker framing */}
      <section id="how" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600">How it works</p>
          <h2 className="mt-2 text-[30px] font-extrabold tracking-tight text-navy-900 sm:text-[38px]">A fitness tracker for your business reputation</h2>
          <p className="mt-3 text-[16px] text-ink-muted">Not another dashboard full of charts. One score, plain-English explanations, and a short list of things to do.</p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { n: "1", icon: <Nfc className="h-5 w-5" />, title: "Collect reviews with a tap", body: "A premium NFC card or stand sits at checkout. Customers tap (or scan the QR) and land straight on your Google review page. The link is yours to change any time — no reprogramming." },
            { n: "2", icon: <BarChart3 className="h-5 w-5" />, title: "See one clear score", body: "The BoostReviews.AI Reputation Score blends rating, review growth, response habits, sentiment, profile health and competitors into a single 0–100 number — with the reasons it moved." },
            { n: "3", icon: <Zap className="h-5 w-5" />, title: "Know your next best move", body: "Every week you get 1–3 prioritized actions: reply to these reviews (we draft them), fix this profile gap, out-pace that competitor. Do them, watch the score climb." },
          ].map((s) => (
            <div key={s.n} className="card card-hover p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl gradient-brand text-white">{s.icon}</span>
                <span className="text-[12px] font-bold uppercase tracking-wider text-ink-subtle">Step {s.n}</span>
              </div>
              <h3 className="mt-4 text-[18px] font-bold text-navy-900">{s.title}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-ink-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-navy-900 py-16 text-white lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-sky-300">What you get</p>
            <h2 className="mt-2 text-[30px] font-extrabold tracking-tight sm:text-[38px]">Everything a busy owner needs. Nothing they don&apos;t.</h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: <Star className="h-5 w-5" />, title: "Reputation Score", body: "One 0–100 score, updated continuously, with a breakdown of exactly what's helping and hurting." },
              { icon: <MessageSquareText className="h-5 w-5" />, title: "AI-assisted replies", body: "Personal, on-brand responses drafted for every review. You approve — nothing publishes without you." },
              { icon: <Sparkles className="h-5 w-5" />, title: "Customer sentiment & themes", body: "What customers love, and which complaints are creeping up — without reading 400 reviews." },
              { icon: <Users className="h-5 w-5" />, title: "Competitor intelligence", body: "Rating, review growth and momentum for nearby businesses, interpreted in plain English." },
              { icon: <Globe className="h-5 w-5" />, title: "Google Profile Health", body: "A checklist score for your Google Business Profile: hours, services, photos, responses." },
              { icon: <FileText className="h-5 w-5" />, title: "Monthly report", body: "A polished report you can share with a partner, manager or franchisor." },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors hover:bg-white/[0.08]">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-sky-300">{f.icon}</span>
                <h3 className="mt-4 text-[17px] font-bold">{f.title}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-white/70">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600">Built for local service businesses</p>
            <h2 className="mt-2 text-[28px] font-extrabold tracking-tight text-navy-900 sm:text-[34px]">If customers can leave you a Google review, BoostReviews.AI works for you.</h2>
            <p className="mt-3 text-[15.5px] leading-relaxed text-ink-muted">Spas and salons, dentists and chiropractors, restaurants, gyms, auto shops, contractors and more. One card at the counter, one score to watch.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Massage & spa", "Med spa", "Barber & salon", "Nails & esthetics", "Chiropractic", "Dental", "Restaurants", "Gyms", "Tattoo", "Auto detail & repair", "Contractors", "Home services"].map((t) => (
                <span key={t} className="rounded-full border border-line bg-canvas px-3 py-1 text-[13px] font-medium text-ink">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="card p-6 sm:p-8">
            <p className="text-[12px] font-bold uppercase tracking-wider text-ink-subtle">What owners tell us after the first month</p>
            <blockquote className="mt-3 text-[20px] font-semibold leading-snug text-navy-900">“I didn&apos;t realize there was this much happening with my Google reputation. This makes it incredibly easy to understand — and I want someone managing it for me.”</blockquote>
            <div className="mt-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-900 text-[12px] font-bold text-white">RM</span>
              <div>
                <p className="text-[14px] font-semibold text-ink">Royal Massage &amp; Spa</p>
                <p className="text-[12px] text-ink-subtle">Demo customer · Austin, TX</p>
              </div>
              <span className="ml-auto inline-flex items-center gap-1 text-[13px] font-semibold text-ink">
                <Star className="h-4 w-4 fill-warning-500 text-warning-500" /> 4.8 · 426 reviews
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section id="pricing" className="bg-canvas py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600">Pricing</p>
            <h2 className="mt-2 text-[30px] font-extrabold tracking-tight text-navy-900 sm:text-[36px]">A premium service, priced like one</h2>
            <p className="mt-3 text-[15.5px] text-ink-muted">Plans from $149 to $299 a month, including the NFC review card. Most businesses earn it back with a handful of new customers.</p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { name: "Starter", price: 149, desc: "Collect reviews and track your score." },
              { name: "Growth", price: 199, desc: "Add sentiment, competitors and next best actions.", hi: true },
              { name: "Premium", price: 299, desc: "We manage responses and strategy for you." },
            ].map((p) => (
              <div key={p.name} className={`card p-6 ${p.hi ? "border-brand-400 ring-2 ring-brand-100" : ""}`}>
                <p className="text-[18px] font-extrabold text-navy-900">{p.name}</p>
                <p className="mt-1 text-[14px] text-ink-muted">{p.desc}</p>
                <p className="mt-4 text-[32px] font-extrabold text-navy-900 tabular">
                  ${p.price}
                  <span className="text-sm font-medium text-ink-subtle">/mo</span>
                </p>
                <Button className="mt-5" full variant={p.hi ? "primary" : "outline"} href="/onboarding">
                  Get started
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="relative overflow-hidden rounded-3xl gradient-brand p-8 text-white sm:p-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-300/30 blur-3xl" />
          <div className="relative grid items-center gap-6 lg:grid-cols-[1fr_auto]">
            <div>
              <h2 className="text-[28px] font-extrabold tracking-tight sm:text-[36px]">See it with real numbers in 10 seconds.</h2>
              <p className="mt-2 max-w-xl text-[16px] text-white/85">Open the live demo for Royal Massage &amp; Spa — a fully populated account with months of reviews, competitors, NFC activity and recommendations.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" variant="white" href="/demo" iconRight={<ArrowRight className="h-5 w-5" />}>
                Explore live demo
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:border-white/50" href="/onboarding">
                Book a demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <Logo height={24} />
          <p className="flex items-center gap-1.5 text-[12.5px] text-ink-subtle">
            <ShieldCheck className="h-3.5 w-3.5" /> Reputation Score and Google Profile Health are BoostReviews.AI assessments, not Google metrics.
          </p>
          <div className="flex gap-4 text-[13px] font-medium text-ink-muted">
            <Link href="/demo" className="hover:text-ink">Demo</Link>
            <Link href="/onboarding" className="hover:text-ink">Get started</Link>
            <Link href="/login" className="hover:text-ink">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
