"use client";

import { Check, CreditCard, Receipt, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { ClientOnly, PageHeader } from "@/components/app/Common";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { ANNUAL_PER_MONTH, ANNUAL_PRICE, MONTHLY_PRICE, PLANS, formatMoney, getPlan } from "@/lib/billing/plans";
import { useBusinessData } from "@/lib/hooks/useBusinessData";
import { useDemoStore } from "@/lib/store/demoStore";
import type { Plan } from "@/lib/types";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

/** Static-export builds have no API routes; skip the round trip. */
const STATIC = process.env.NEXT_PUBLIC_STATIC_DEMO === "1";

export default function BillingPage() {
  return (
    <ClientOnly>
      <Billing />
    </ClientOnly>
  );
}

function Billing() {
  const d = useBusinessData();
  const { toast } = useToast();
  const setPlan = useDemoStore((s) => s.setPlan);
  const [confirm, setConfirm] = useState<Plan | null>(null);
  const [annual, setAnnual] = useState(false);
  const [loading, setLoading] = useState(false);
  const current = getPlan(d.subscription.plan);

  const changePlan = async () => {
    if (!confirm) return;
    setLoading(true);
    try {
      // In production this creates a Stripe Checkout / Billing Portal session.
      if (STATIC) throw new Error("static");
      const res = await fetch("/api/stripe/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan: confirm, interval: annual ? "year" : "month" }) });
      const json = (await res.json()) as { mode: string; url?: string };
      if (json.mode === "live" && json.url) {
        window.location.href = json.url;
        return;
      }
    } catch {
      /* demo fallback */
    }
    await new Promise((r) => setTimeout(r, 500));
    setPlan(confirm);
    setLoading(false);
    setConfirm(null);
    toast({ kind: "success", title: `Switched to ${getPlan(confirm).name} (demo)`, description: "Stripe checkout runs here once live keys are configured." });
  };

  const invoices = [0, 1, 2, 3].map((i) => {
    const dte = new Date(d.subscription.currentPeriodEnd + "T00:00:00");
    dte.setMonth(dte.getMonth() - (i + 1));
    return { id: `INV-${2041 - i}`, date: dte.toISOString(), amount: current.priceMonthly, status: "Paid" };
  });

  return (
    <>
      <PageHeader title="Billing" subtitle="Your BoostReviewsAI subscription" />

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader title="Current plan" action={<Badge tone="success" dot>{d.subscription.status === "demo" ? "Demo" : "Active"}</Badge>} />
          <CardBody className="pt-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[26px] font-extrabold tracking-tight text-navy-900">{current.name}</p>
                <p className="text-[14px] text-ink-muted">{current.tagline}</p>
              </div>
              <p className="text-[22px] font-extrabold text-navy-900 tabular">
                {formatCurrency(MONTHLY_PRICE)}
                <span className="text-sm font-medium text-ink-subtle">/month</span>
              </p>
            </div>
            <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
              {current.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-[13.5px] text-ink">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success-500" /> {f}
                </li>
              ))}
            </ul>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Info label="Next billing date" value={formatDate(d.subscription.currentPeriodEnd + "T00:00:00", "long")} />
              <Info label="Payment method" value={d.subscription.paymentMethod ? `${d.subscription.paymentMethod.brand} •••• ${d.subscription.paymentMethod.last4}` : "None"} />
              <Info label="Billing email" value="owner@royalmassageandspa.com" />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" icon={<CreditCard className="h-4 w-4" />} onClick={() => toast({ kind: "info", title: "Stripe Billing Portal", description: "Opens the customer portal once Stripe is live." })}>
                Update payment method
              </Button>
              <Button variant="ghost" size="sm" onClick={() => toast({ kind: "info", title: "Manage subscription", description: "Cancel or pause via the Stripe Billing Portal in production." })}>
                Manage subscription
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Invoices" icon={<Receipt className="h-4 w-4" />} />
          <CardBody className="pt-2">
            <ul className="divide-y divide-line">
              {invoices.map((inv) => (
                <li key={inv.id} className="flex items-center justify-between py-2.5 text-[13.5px]">
                  <div>
                    <p className="font-semibold text-ink">{inv.id}</p>
                    <p className="text-[12px] text-ink-subtle">{formatDate(inv.date, "long")}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-ink tabular">{formatCurrency(inv.amount)}</p>
                    <Badge tone="success">{inv.status}</Badge>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-3 flex items-start gap-2 text-[12px] text-ink-subtle">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Payments are processed by Stripe. BoostReviewsAI never stores card numbers.
            </p>
          </CardBody>
        </Card>
      </section>

      <section className="mt-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[12px] font-bold uppercase tracking-wider text-ink-subtle">Plans · every plan is {formatCurrency(MONTHLY_PRICE)}/mo after setup</p>
          <div className="inline-flex items-center rounded-xl bg-canvas p-1 ring-1 ring-inset ring-line">
            <button onClick={() => setAnnual(false)} className={cn("h-8 rounded-lg px-3 text-[12.5px] font-semibold", !annual ? "bg-white text-ink shadow" : "text-ink-muted")}>Monthly</button>
            <button onClick={() => setAnnual(true)} className={cn("h-8 rounded-lg px-3 text-[12.5px] font-semibold", annual ? "bg-white text-ink shadow" : "text-ink-muted")}>Annual · 3 months free</button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((p) => {
            const isCurrent = p.id === current.id;
            return (
              <div key={p.id} className={cn("card relative flex flex-col p-5", p.highlight && "border-brand-400 ring-2 ring-brand-100")}>
                {p.highlight && <Badge tone="brand" className="absolute -top-3 left-5">Most popular</Badge>}
                <p className="text-[18px] font-extrabold text-navy-900">{p.name}</p>
                <p className="text-[13px] text-ink-muted">{p.tagline}</p>
                <p className="mt-3 text-[28px] font-extrabold text-navy-900 tabular">
                  {formatMoney(p.setupFee)}
                  <span className="text-sm font-medium text-ink-subtle"> to start</span>
                </p>
                <p className="text-[12.5px] text-ink-muted">then {annual ? `$${ANNUAL_PER_MONTH.toFixed(2)}/mo billed $${ANNUAL_PRICE}/yr` : `$${MONTHLY_PRICE}/mo`}</p>
                <ul className="mt-4 flex-1 space-y-1.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[13px] text-ink">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" /> {f}
                    </li>
                  ))}
                </ul>
                <Button className="mt-5" variant={isCurrent ? "outline" : p.highlight ? "primary" : "secondary"} disabled={isCurrent} onClick={() => setConfirm(p.id)} full>
                  {isCurrent ? "Current plan" : p.setupFee > current.setupFee ? "Upgrade" : "Switch"}
                </Button>
              </div>
            );
          })}
        </div>
      </section>

      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm ? `Switch to ${getPlan(confirm).name}?` : ""}
        description={confirm ? `${formatMoney(getPlan(confirm).setupFee)} setup, then ${annual ? `$${ANNUAL_PRICE}/year` : `$${MONTHLY_PRICE}/month`}.` : ""}
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button onClick={changePlan} loading={loading}>
              Confirm
            </Button>
          </div>
        }
      >
        <p className="text-sm text-ink-muted">Demo mode: no card is charged. In production this opens Stripe Checkout.</p>
      </Modal>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-canvas p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">{label}</p>
      <p className="mt-0.5 truncate text-[14px] font-semibold text-ink">{value}</p>
    </div>
  );
}
