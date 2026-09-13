"use client";

import { ArrowRight, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

/**
 * Sign-in screen. Production: Supabase Auth (magic link + Google). The demo
 * never requires an account — "Explore live demo" goes straight to the app.
 */
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/magic-link", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      void res;
    } catch {
      /* demo */
    }
    await new Promise((r) => setTimeout(r, 500));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="flex h-16 items-center px-4 sm:px-6">
        <Logo height={38} priority />
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 pb-16">
        <div className="card p-6 sm:p-8">
          <h1 className="text-[24px] font-extrabold tracking-tight text-navy-900">Sign in</h1>
          <p className="mt-1 text-[14.5px] text-ink-muted">We&apos;ll email you a secure sign-in link. No password to remember.</p>
          {sent ? (
            <div className="mt-6 rounded-2xl bg-success-100/60 p-4 text-[14px] text-success-600">
              <p className="font-semibold">Check your inbox</p>
              <p className="mt-0.5 text-success-600/90">If an account exists for {email}, a sign-in link is on its way. (Demo deployment: email delivery is enabled with production auth.)</p>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-3">
              <label className="block">
                <span className="mb-1 block text-[12px] font-semibold text-ink-muted">Email</span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@yourbusiness.com" className="h-11 w-full rounded-xl border border-line bg-white pl-9 pr-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
                </div>
              </label>
              <Button type="submit" full loading={loading}>
                Email me a sign-in link
              </Button>
              <Button type="button" variant="outline" full href="/api/google/oauth/start" icon={<ShieldCheck className="h-4 w-4" />}>
                Continue with Google (production)
              </Button>
            </form>
          )}
          <div className="mt-6 border-t border-line pt-5">
            <p className="text-[12px] font-bold uppercase tracking-wider text-ink-subtle">Just want to see it?</p>
            <Button variant="secondary" full className="mt-2" href="/demo" icon={<Sparkles className="h-4 w-4" />} iconRight={<ArrowRight className="h-4 w-4" />}>
              Explore live demo — no account needed
            </Button>
          </div>
        </div>
        <p className="mt-4 text-center text-[12px] text-ink-subtle">
          New here?{" "}
          <a href="/onboarding" className="font-semibold text-brand-600">
            Get BoostReviews.AI
          </a>
        </p>
      </main>
    </div>
  );
}
