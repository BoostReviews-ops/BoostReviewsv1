import { ArrowRight, BarChart3, Check, Nfc, Star, Zap, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { HeroPreview } from "@/components/landing/HeroPreview";
import { FeatureExplorer } from "@/components/landing/FeatureExplorer";
import { ImpactCalculator } from "@/components/landing/ImpactCalculator";
import { Pricing } from "@/components/landing/Pricing";

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-line/70 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-6xl items-center justify-between px-4 sm:px-6">
          <span className="sm:hidden"><Logo height={34} priority /></span>
          <span className="hidden sm:inline"><Logo height={50} priority /></span>
          <nav className="hidden items-center gap-7 text-[14px] font-medium text-ink-muted md:flex" aria-label="Primary">
            <a href="#how" className="hover:text-ink">How it works</a>
            <a href="#features" className="hover:text-ink">What you get</a>
            <a href="#impact" className="hover:text-ink">The upside</a>
            <a href="#pricing" className="hover:text-ink">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" href="/login" className="hidden sm:inline-flex">
              Sign in
            </Button>
            <Button size="sm" href="/demo" iconRight={<ArrowRight className="h-4 w-4" />}>
              <span className="sm:hidden">Live demo</span>
              <span className="hidden sm:inline">Explore live demo</span>
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
              <Nfc className="h-3.5 w-3.5" /> Tap-to-review card + Google reputation intelligence
            </span>
            <h1 className="mt-5 text-[38px] font-extrabold leading-[1.05] tracking-tight text-navy-900 sm:text-[52px] lg:text-[60px]">
              Get more reviews.
              <br />
              <span className="text-gradient-brand">Understand your reputation.</span>
              <br />
              Know what to do next.
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-ink-muted">
              Customers tap a card at your counter and land on your Google review page. We turn every review, reply and competitor move into one clear score, and hand you a short list of what to do this week.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" href="/demo" iconRight={<ArrowRight className="h-5 w-5" />}>
                Explore live demo
              </Button>
              <Button size="lg" variant="outline" href="/onboarding">
                Get BoostReviewsAI
              </Button>
            </div>
            <p className="mt-3 text-[13px] text-ink-subtle">No account needed. See a fully populated dashboard in ten seconds.</p>
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

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600">How it works</p>
          <h2 className="mt-2 text-[30px] font-extrabold tracking-tight text-navy-900 sm:text-[38px]">A fitness tracker for your reputation</h2>
          <p className="mt-3 text-[16px] text-ink-muted">Not another dashboard full of charts. One score, plain-English explanations, and a short list of things to do.</p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { n: "1", icon: <Nfc className="h-5 w-5" />, title: "Collect reviews with a tap", body: "A premium card or stand sits at checkout. Customers tap it, or scan the QR, and go straight to your Google review page. You control where the link goes, without ever reprogramming the card." },
            { n: "2", icon: <BarChart3 className="h-5 w-5" />, title: "See one clear score", body: "Your Reputation Score blends rating, review growth, reply habits, customer sentiment, profile health and nearby competitors into a single 0 to 100 number, with the reasons it moved." },
            { n: "3", icon: <Zap className="h-5 w-5" />, title: "Know your next best move", body: "Each week you get one to three prioritized actions: approve these replies, fix this profile gap, out-pace that competitor. Do them and watch the score climb." },
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
            <p className="mt-3 text-[15.5px] text-white/70">Tap a tool to see it working with real numbers. Each one answers a question you already ask.</p>
          </div>
          <FeatureExplorer />
        </div>
      </section>

      {/* Who it's for + testimonial */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600">Built for local service businesses</p>
            <h2 className="mt-2 text-[28px] font-extrabold tracking-tight text-navy-900 sm:text-[34px]">If customers can leave you a Google review, this works for you.</h2>
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
            <blockquote className="mt-3 text-[20px] font-semibold leading-snug text-navy-900">&ldquo;It&apos;s so easy to just reply to Google reviews now. I just press approve to auto-reply messages for me.&rdquo;</blockquote>
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

      <Pricing />

      {/* Impact */}
      <section id="impact" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600">The upside</p>
          <h2 className="mt-2 text-[30px] font-extrabold tracking-tight text-navy-900 sm:text-[38px]">What a stronger Google reputation is worth to you</h2>
          <p className="mt-3 text-[16px] text-ink-muted">Ranking higher, showing a higher rating and answering every review all pull in the same direction: more of the people searching for what you do pick you. Move the sliders to see it in your numbers.</p>
        </div>
        <ImpactCalculator />
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:pb-24">
        <div className="relative overflow-hidden rounded-3xl gradient-brand p-8 text-white sm:p-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-300/30 blur-3xl" />
          <div className="relative grid items-center gap-6 lg:grid-cols-[1fr_auto]">
            <div>
              <h2 className="text-[28px] font-extrabold tracking-tight sm:text-[36px]">See it with real numbers in ten seconds.</h2>
              <p className="mt-2 max-w-xl text-[16px] text-white/85">Open the live demo for Royal Massage &amp; Spa: months of reviews, competitors, card activity and recommendations, fully populated.</p>
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
          <Logo height={34} />
          <p className="flex items-center gap-1.5 text-[12.5px] text-ink-subtle">
            <ShieldCheck className="h-3.5 w-3.5" /> Reputation Score and Google Profile Health are BoostReviewsAI assessments, not Google metrics.
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
