"use client";

import { Bell, Building2, Database, Globe, KeyRound, Plug, RotateCcw, Shield, Sparkles, Users } from "lucide-react";
import { useState } from "react";
import { ClientOnly, PageHeader } from "@/components/app/Common";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useBusinessData } from "@/lib/hooks/useBusinessData";
import { useDemoStore } from "@/lib/store/demoStore";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  return (
    <ClientOnly>
      <Settings />
    </ClientOnly>
  );
}

function Settings() {
  const d = useBusinessData();
  const { toast } = useToast();
  const reset = useDemoStore((s) => s.resetDemo);
  const [resetOpen, setResetOpen] = useState(false);
  const [notify, setNotify] = useState({ newReview: true, negativeReview: true, weeklyDigest: true, monthlyReport: true, scoreDrop: true });
  const [form, setForm] = useState({ name: d.business.name, phone: d.business.phone, website: d.business.website, address: `${d.business.address}, ${d.business.city}` });

  return (
    <>
      <PageHeader title="Settings" subtitle="Business details, integrations, notifications and your team" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Business" subtitle="Shown on reports and used to match your Google profile" icon={<Building2 className="h-4 w-4" />} />
          <CardBody className="space-y-3 pt-3">
            {(
              [
                ["name", "Business name"],
                ["phone", "Phone"],
                ["website", "Website"],
                ["address", "Address"],
              ] as const
            ).map(([k, label]) => (
              <label key={k} className="block">
                <span className="mb-1 block text-[12px] font-semibold text-ink-muted">{label}</span>
                <input value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="h-11 w-full rounded-xl border border-line px-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
              </label>
            ))}
            <Button size="sm" onClick={() => toast({ kind: "success", title: "Business details saved (demo)" })}>
              Save changes
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Integrations" subtitle="Connections that power your dashboard" icon={<Plug className="h-4 w-4" />} />
          <CardBody className="pt-2">
            <ul className="divide-y divide-line">
              <Integration icon={<Globe className="h-4 w-4" />} name="Google Business Profile" status={d.mode === "live" ? "ready" : "demo"} note={d.mode === "live" ? "Authorize BoostReviewsAI to read your reviews and publish replies you approve." : "Demo data provider active. Connect your real profile in production — no data is being pulled from Google."} action={d.mode === "live" ? "Connect Google" : "Connect (production)"} onAction={() => (d.mode === "live" ? (window.location.href = "/api/google/oauth/start") : toast({ kind: "info", title: "Google connection", description: "Available to signed-in accounts on the production deployment." }))} />
              <Integration icon={<Sparkles className="h-4 w-4" />} name="AI assistant" status="demo" note="Demo reply generator active. Production uses a server-side AI provider; keys never reach the browser." />
              <Integration icon={<KeyRound className="h-4 w-4" />} name="Stripe billing" status="demo" note="Test billing. Switch to live keys to charge real subscriptions." />
              <Integration icon={<Database className="h-4 w-4" />} name="Supabase database" status="ready" note="Schema ready (supabase/migrations). Demo persists locally in your browser." />
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Notifications" subtitle="How we keep you in the loop" icon={<Bell className="h-4 w-4" />} />
          <CardBody className="pt-2">
            <ul className="divide-y divide-line">
              {(
                [
                  ["newReview", "New review received", "Instant email"],
                  ["negativeReview", "Negative review (1–3 stars)", "Instant email + SMS"],
                  ["scoreDrop", "Reputation Score drops 3+ points", "Email"],
                  ["weeklyDigest", "Weekly digest", "Monday mornings"],
                  ["monthlyReport", "Monthly report", "1st of the month"],
                ] as const
              ).map(([k, label, sub]) => (
                <li key={k} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-[14px] font-semibold text-ink">{label}</p>
                    <p className="text-[12px] text-ink-subtle">{sub}</p>
                  </div>
                  <button role="switch" aria-checked={notify[k]} onClick={() => setNotify({ ...notify, [k]: !notify[k] })} className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors", notify[k] ? "bg-brand-600" : "bg-line-strong")}>
                    <span className={cn("absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform", notify[k] ? "translate-x-5.5 left-0.5" : "left-0.5")} />
                  </button>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Team" subtitle="Who can access this account" icon={<Users className="h-4 w-4" />} />
          <CardBody className="pt-2">
            <ul className="divide-y divide-line">
              {[
                ["Alexis Romero", "owner@royalmassageandspa.com", "Owner"],
                ["Front Desk", "frontdesk@royalmassageandspa.com", "Member"],
                ["BoostReviewsAI", "support@boostreviewsai.com", "Agency admin"],
              ].map(([n, e, role]) => (
                <li key={e} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-ink">{n}</p>
                    <p className="truncate text-[12px] text-ink-subtle">{e}</p>
                  </div>
                  <Badge tone={role === "Owner" ? "navy" : role === "Agency admin" ? "brand" : "neutral"}>{role}</Badge>
                </li>
              ))}
            </ul>
            <Button size="sm" variant="outline" className="mt-3" onClick={() => toast({ kind: "info", title: "Invites ship with production auth" })}>
              Invite teammate
            </Button>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Demo controls" subtitle="This account is running on seeded demo data" icon={<Shield className="h-4 w-4" />} />
          <CardBody className="flex flex-col gap-3 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-[13.5px] text-ink-muted">Everything you change in the demo (replies, card destination, completed actions, audit requests) is saved in this browser only. Reset to restore the original Royal Massage &amp; Spa data.</p>
            <Button variant="outline" icon={<RotateCcw className="h-4 w-4" />} onClick={() => setResetOpen(true)}>
              Reset demo
            </Button>
          </CardBody>
        </Card>
      </div>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset the demo?"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setResetOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                reset();
                setResetOpen(false);
                toast({ kind: "success", title: "Demo reset" });
              }}
            >
              Reset demo
            </Button>
          </div>
        }
      >
        <p className="text-sm text-ink-muted">All demo edits will be cleared and the seeded data restored.</p>
      </Modal>
    </>
  );
}

function Integration({ icon, name, status, note, action, onAction }: { icon: React.ReactNode; name: string; status: "demo" | "ready" | "connected"; note: string; action?: string; onAction?: () => void }) {
  return (
    <li className="flex items-start gap-3 py-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-canvas text-brand-600">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[14px] font-semibold text-ink">{name}</p>
          <Badge tone={status === "connected" ? "success" : status === "ready" ? "brand" : "sky"} dot>
            {status === "connected" ? "Connected" : status === "ready" ? "Ready" : "Demo mode"}
          </Badge>
        </div>
        <p className="mt-0.5 text-[12.5px] leading-snug text-ink-muted">{note}</p>
      </div>
      {action && (
        <Button size="sm" variant="outline" onClick={onAction} className="shrink-0">
          {action}
        </Button>
      )}
    </li>
  );
}
