"use client";

import {
  Home,
  Building2,
  Check,
  ChevronDown,
  CreditCard,
  FileText,
  Globe,
  LayoutDashboard,
  Lightbulb,
  MessageSquareText,
  MoreHorizontal,
  Nfc,
  Plus,
  RotateCcw,
  Settings,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useDemoStore } from "@/lib/store/demoStore";
import { LiveDataLoader } from "@/components/app/LiveDataLoader";
import { cn } from "@/lib/utils";

export const NAV = [
  { href: "/app", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/app/reviews", label: "Reviews", icon: MessageSquareText },
  { href: "/app/insights", label: "Insights", icon: Lightbulb },
  { href: "/app/review-card", label: "Review Card", icon: Nfc },
  { href: "/app/competitors", label: "Competitors", icon: Users },
  { href: "/app/google-profile", label: "Google Profile", icon: Globe },
  { href: "/app/reports", label: "Reports", icon: FileText },
  { href: "/app/billing", label: "Billing", icon: CreditCard },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

const MOBILE_PRIMARY = ["/app", "/app/reviews", "/app/insights", "/app/review-card"];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
}

/* ---------------- Business / account selector ---------------- */

function BusinessSelector({ compact }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const biz = useDemoStore((s) => (s.mode === "live" && s.liveDataset ? s.liveDataset.business : null));
  const name = biz?.name ?? "Royal Massage & Spa";
  const sub = biz ? `${biz.locations[0]?.name ?? "Main"}${biz.city ? ` · ${biz.city}` : ""}` : "Westgate · Austin, TX";
  const mono = name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-xl border border-line bg-white text-left transition-colors hover:border-line-strong hover:bg-canvas/60",
          compact ? "h-10 px-2.5" : "px-3 py-2.5",
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-[11px] font-bold text-white">{mono}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold leading-tight text-ink">{name}</span>
          {!compact && <span className="block truncate text-[11px] leading-tight text-ink-subtle">{sub}</span>}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-ink-subtle" />
      </button>
      {open && (
        <div className="absolute left-0 right-0 z-40 mt-1.5 min-w-[260px] overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-[var(--shadow-pop)] animate-fade-up" role="listbox">
          <p className="px-2.5 pb-1 pt-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-subtle">Businesses</p>
          <button className="flex w-full items-center gap-2.5 rounded-xl bg-brand-50 px-2.5 py-2 text-left" role="option" aria-selected>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-navy-900 text-[11px] font-bold text-white">{mono}</span>
            <span className="flex-1">
              <span className="block text-[13px] font-semibold text-ink">{name}</span>
              <span className="block text-[11px] text-ink-muted">1 location · Growth plan</span>
            </span>
            <Check className="h-4 w-4 text-brand-600" />
          </button>
          <p className="px-2.5 pb-1 pt-2.5 text-[11px] font-bold uppercase tracking-wider text-ink-subtle">Locations</p>
          <div className="flex items-center gap-2.5 rounded-xl px-2.5 py-2">
            <Building2 className="h-4 w-4 text-ink-subtle" />
            <span className="flex-1 text-[13px] font-medium text-ink">{biz?.locations[0]?.name ?? "Westgate"} (primary)</span>
            <Check className="h-4 w-4 text-brand-600" />
          </div>
          <div className="mt-1 border-t border-line pt-1">
            <Link href="/onboarding" className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-medium text-ink-muted hover:bg-canvas hover:text-ink">
              <Plus className="h-4 w-4" /> Add a business or location
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Reset demo ---------------- */

function ResetDemo({ className, variant = "ghost" }: { className?: string; variant?: "ghost" | "outline" }) {
  const [open, setOpen] = useState(false);
  const reset = useDemoStore((s) => s.resetDemo);
  const { toast } = useToast();
  return (
    <>
      <Button variant={variant} size="sm" className={className} icon={<RotateCcw className="h-4 w-4" />} onClick={() => setOpen(true)}>
        Reset demo
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Reset the demo?"
        description="This restores the seeded Royal Massage & Spa data: saved replies, card settings, completed actions and audit requests will be cleared."
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                reset();
                setOpen(false);
                toast({ kind: "success", title: "Demo reset", description: "Seeded data restored." });
              }}
            >
              Reset demo
            </Button>
          </div>
        }
      >
        <p className="text-sm text-ink-muted">You can reset as many times as you like. Nothing is sent to Google in demo mode.</p>
      </Modal>
    </>
  );
}

/* ---------------- Shell ---------------- */

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <div className="flex min-h-dvh bg-canvas">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-[272px] shrink-0 flex-col border-r border-line bg-white lg:flex">
        <div className="px-5 pb-4 pt-5">
          <Logo height={42} href="/" priority />
        </div>
        <div className="px-3">
          <BusinessSelector />
        </div>
        <nav className="mt-4 flex-1 space-y-0.5 px-3" aria-label="Main">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors",
                  active ? "bg-brand-50 text-brand-700" : "text-ink-muted hover:bg-canvas hover:text-ink",
                )}
                aria-current={active ? "page" : undefined}
              >
                <item.icon className={cn("h-[18px] w-[18px]", active ? "text-brand-600" : "text-ink-subtle group-hover:text-ink")} strokeWidth={2} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-2 px-3 pb-4">
          <Link href="/app/website" className="block rounded-2xl gradient-brand p-4 text-white transition-transform hover:-translate-y-0.5">
            <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-sky-300">
              <Sparkles className="h-3.5 w-3.5" /> Website upgrade
            </div>
            <p className="mt-1.5 text-[13px] font-semibold leading-snug">Your website should work as hard as your reputation.</p>
            <p className="mt-2 text-[12px] font-semibold text-white/90 underline-offset-2 hover:underline">Request a free audit →</p>
          </Link>
          <Link href="/" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium text-ink-muted hover:bg-canvas hover:text-ink">
            <Home className="h-4 w-4 text-ink-subtle" /> BoostReviewsAI home
          </Link>
          <div className="flex items-center justify-between rounded-xl bg-canvas px-3 py-2">
            <span className="flex items-center gap-1.5 whitespace-nowrap text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" /> Demo mode
            </span>
            <ResetDemo />
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile / tablet top bar */}
        <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur-md lg:hidden">
          <div className="flex h-[68px] items-center justify-between gap-3 px-4">
            <Logo height={32} href="/" priority />
            <div className="w-[170px] sm:w-[220px]">
              <BusinessSelector compact />
            </div>
          </div>
        </header>

        <LiveDataLoader />
        <main className="mx-auto w-full max-w-[1180px] flex-1 px-4 pb-28 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pb-12">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur-md safe-bottom lg:hidden" aria-label="Mobile">
        <div className="grid grid-cols-5 px-1 pt-1.5">
          {NAV.filter((n) => MOBILE_PRIMARY.includes(n.href)).map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            return (
              <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 py-1" aria-current={active ? "page" : undefined}>
                <span className={cn("flex h-8 w-12 items-center justify-center rounded-full transition-colors", active ? "bg-brand-50 text-brand-600" : "text-ink-subtle")}>
                  <item.icon className="h-[20px] w-[20px]" strokeWidth={active ? 2.4 : 2} />
                </span>
                <span className={cn("text-[10.5px] font-semibold", active ? "text-brand-700" : "text-ink-muted")}>{item.label === "Review Card" ? "Card" : item.label}</span>
              </Link>
            );
          })}
          <button onClick={() => setMoreOpen(true)} className="flex flex-col items-center gap-1 py-1" aria-label="More">
            <span className={cn("flex h-8 w-12 items-center justify-center rounded-full", !MOBILE_PRIMARY.some((h) => isActive(pathname, h, h === "/app")) ? "bg-brand-50 text-brand-600" : "text-ink-subtle")}>
              <MoreHorizontal className="h-[20px] w-[20px]" />
            </span>
            <span className="text-[10.5px] font-semibold text-ink-muted">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile "More" sheet */}
      {moreOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden" role="dialog" aria-modal="true">
          <button className="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px] animate-fade-in" onClick={() => setMoreOpen(false)} aria-label="Close menu" />
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-4 safe-bottom animate-fade-up">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-base font-bold text-ink">More</p>
              <button onClick={() => setMoreOpen(false)} className="rounded-lg p-1.5 text-ink-subtle hover:bg-canvas" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {NAV.filter((n) => !MOBILE_PRIMARY.includes(n.href)).map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMoreOpen(false)} className={cn("flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-[14px] font-semibold", active ? "border-brand-100 bg-brand-50 text-brand-700" : "border-line text-ink")}>
                    <item.icon className="h-5 w-5 text-brand-600" />
                    {item.label}
                  </Link>
                );
              })}
              <Link href="/app/website" onClick={() => setMoreOpen(false)} className="col-span-2 flex items-center gap-3 rounded-2xl gradient-brand px-3.5 py-3 text-[14px] font-semibold text-white">
                <Sparkles className="h-5 w-5 text-sky-300" /> Website upgrade
              </Link>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl bg-canvas px-3 py-2">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" /> Demo mode · seeded data
              </span>
              <ResetDemo />
            </div>
            <Link href="/" className="mt-3 flex h-11 items-center justify-center gap-2 rounded-xl border border-line text-[14px] font-semibold text-ink">
              <Home className="h-4 w-4 text-brand-600" /> BoostReviewsAI home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
