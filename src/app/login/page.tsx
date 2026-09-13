"use client";

import { ArrowRight, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { useToast } from "@/components/ui/Toast";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const LIVE = !!SUPABASE_URL && !!SUPABASE_ANON;

/**
 * Sign-in. Live: Supabase Auth (magic link + Google) from the browser with the
 * public anon key. Demo deployments show the same screen without sending mail.
 */
export default function LoginPage() {
  return (
    <Suspense>
      <Login />
    </Suspense>
  );
}

function Login() {
  const { toast } = useToast();
  const params = useSearchParams();
  const next = params.get("next") ?? "/app";
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = LIVE ? createBrowserClient(SUPABASE_URL!, SUPABASE_ANON!) : null;
  const callback = () => `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (supabase) {
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: callback() } });
      setLoading(false);
      if (error) {
        toast({ kind: "error", title: "Couldn't send the link", description: error.message });
        return;
      }
    } else {
      await new Promise((r) => setTimeout(r, 500));
      setLoading(false);
    }
    setSent(true);
  };

  const google = async () => {
    if (!supabase) {
      toast({ kind: "info", title: "Sign-in opens at launch", description: "Accounts are created with the production launch. Explore the live demo meanwhile." });
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: callback() } });
    if (error) toast({ kind: "error", title: "Google sign-in failed", description: error.message });
  };

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="flex h-[72px] items-center px-4 sm:px-6">
        <Logo height={40} priority />
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 pb-16">
        <div className="card p-6 sm:p-8">
          <h1 className="text-[24px] font-extrabold tracking-tight text-navy-900">Sign in</h1>
          <p className="mt-1 text-[14.5px] text-ink-muted">We&apos;ll email you a secure sign-in link. No password to remember.</p>
          {params.get("error") && <p className="mt-3 rounded-xl bg-danger-100/60 px-3 py-2 text-[13px] text-danger-600">Sign-in failed: {params.get("error")}. Try again.</p>}
          {sent ? (
            <div className="mt-6 rounded-2xl bg-success-100/60 p-4 text-[14px] text-success-600">
              <p className="font-semibold">Check your inbox</p>
              <p className="mt-0.5 text-success-600/90">{LIVE ? `A sign-in link is on its way to ${email}.` : `Demo deployment: email delivery is enabled with production auth.`}</p>
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
              <Button type="button" variant="outline" full icon={<ShieldCheck className="h-4 w-4" />} onClick={google}>
                Continue with Google
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
            Get BoostReviewsAI
          </a>
        </p>
      </main>
    </div>
  );
}
