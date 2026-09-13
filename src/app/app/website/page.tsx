"use client";

import { CheckCircle2, Globe, MonitorSmartphone, Rocket, Sparkles, CalendarCheck, Wrench } from "lucide-react";
import { useState } from "react";
import { ClientOnly, PageHeader } from "@/components/app/Common";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { useBusinessData } from "@/lib/hooks/useBusinessData";
import { useDemoStore } from "@/lib/store/demoStore";
import { formatDate } from "@/lib/utils";

export default function WebsitePage() {
  return (
    <ClientOnly>
      <Website />
    </ClientOnly>
  );
}

function Website() {
  const d = useBusinessData();
  const addLead = useDemoStore((s) => s.addWebsiteLead);
  const { toast } = useToast();
  const [form, setForm] = useState({ contactName: "Alexis Romero", email: "owner@royalmassageandspa.com", phone: d.business.phone, websiteUrl: d.business.website, notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.contactName) {
      toast({ kind: "error", title: "Name and email are required" });
      return;
    }
    setSubmitting(true);
    try {
      await fetch("/api/website-audit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, businessId: d.business.id }) });
    } catch {
      /* the demo store is the source of truth */
    }
    await new Promise((r) => setTimeout(r, 500));
    addLead({ ...form, businessId: d.business.id });
    setSubmitting(false);
    setDone(true);
    toast({ kind: "success", title: "Audit requested", description: "We'll review your site and send findings within 2 business days." });
  };

  return (
    <>
      <PageHeader title="Website Upgrade" subtitle="A separate BoostReviews.AI service — your site, on your domain, working as hard as your reputation" />

      <section className="grid gap-4 lg:grid-cols-[1fr_400px]">
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="gradient-brand p-6 text-white sm:p-8">
              <Badge tone="sky" className="bg-white/15 text-white ring-white/20">
                <Sparkles className="h-3 w-3" /> Separate service
              </Badge>
              <h2 className="mt-3 text-[24px] font-extrabold leading-tight tracking-tight sm:text-[30px]">Your website should work as hard as your reputation.</h2>
              <p className="mt-2 max-w-xl text-[15px] text-white/85">You&apos;re earning a {d.googleRating.toFixed(1)}-star reputation. When customers click through from Google, your website should close the deal — fast, mobile-friendly, and easy to book.</p>
            </div>
            <CardBody className="grid gap-4 pt-5 sm:grid-cols-2">
              {[
                { icon: <Rocket className="h-4 w-4" />, title: "Professional website refresh", desc: "A modern design that matches the quality of your service, built on your existing domain." },
                { icon: <MonitorSmartphone className="h-4 w-4" />, title: "Mobile optimization", desc: "Most of your Google traffic is on phones. We make every page fast and thumb-friendly." },
                { icon: <CalendarCheck className="h-4 w-4" />, title: "Booking & contact optimization", desc: "Click-to-call, click-to-book and clear hours front and center." },
                { icon: <Wrench className="h-4 w-4" />, title: "Ongoing website care", desc: "Updates, security and small changes handled for you every month." },
              ].map((f) => (
                <div key={f.title} className="flex gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">{f.icon}</span>
                  <div>
                    <p className="text-[14.5px] font-semibold text-ink">{f.title}</p>
                    <p className="mt-0.5 text-[13px] leading-snug text-ink-muted">{f.desc}</p>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          {d.websiteLeads.length > 0 && (
            <Card>
              <CardHeader title="Your requests" icon={<Globe className="h-4 w-4" />} />
              <CardBody className="pt-2">
                <ul className="divide-y divide-line">
                  {d.websiteLeads.map((l) => (
                    <li key={l.id} className="flex items-center justify-between gap-3 py-2.5 text-[13.5px]">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">Website audit · {l.websiteUrl.replace("https://", "")}</p>
                        <p className="text-[12px] text-ink-subtle">Requested {formatDate(l.createdAt, "long")}</p>
                      </div>
                      <Badge tone="brand">In review</Badge>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}
        </div>

        <Card className="lg:sticky lg:top-6 lg:self-start">
          {done ? (
            <CardBody className="flex flex-col items-center py-10 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success-100 text-success-600">
                <CheckCircle2 className="h-7 w-7" />
              </span>
              <p className="mt-4 text-lg font-bold text-ink">Audit request received</p>
              <p className="mt-1 text-[14px] text-ink-muted">We&apos;ll review {form.websiteUrl.replace("https://", "")} and send a short findings report within 2 business days. No obligation.</p>
              <Button variant="outline" className="mt-5" onClick={() => setDone(false)}>
                Request another
              </Button>
            </CardBody>
          ) : (
            <>
              <CardHeader title="Request a free website audit" subtitle="Takes 30 seconds. We'll send findings, not a sales pitch." />
              <CardBody className="pt-3">
                <form onSubmit={submit} className="space-y-3">
                  {(
                    [
                      ["contactName", "Your name", "text"],
                      ["email", "Email", "email"],
                      ["phone", "Phone", "tel"],
                      ["websiteUrl", "Current website", "url"],
                    ] as const
                  ).map(([k, label, type]) => (
                    <label key={k} className="block">
                      <span className="mb-1 block text-[12px] font-semibold text-ink-muted">{label}</span>
                      <input type={type} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} required={k === "email" || k === "contactName"} className="h-11 w-full rounded-xl border border-line px-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
                    </label>
                  ))}
                  <label className="block">
                    <span className="mb-1 block text-[12px] font-semibold text-ink-muted">What would you like to improve? (optional)</span>
                    <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full rounded-xl border border-line p-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" placeholder="e.g. Online booking, mobile speed, a fresh look" />
                  </label>
                  <Button type="submit" full loading={submitting} icon={<Sparkles className="h-4 w-4" />}>
                    Request website audit
                  </Button>
                  <p className="text-center text-[11.5px] text-ink-subtle">Website services are billed separately from your BoostReviews.AI subscription.</p>
                </form>
              </CardBody>
            </>
          )}
        </Card>
      </section>
    </>
  );
}
