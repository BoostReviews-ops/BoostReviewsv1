"use client";

import { Check, Copy, ExternalLink, Link2, Nfc, Pause, Play, QrCode, Smartphone, Sparkles, MapPin } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { ClientOnly, PageHeader, StatCard } from "@/components/app/Common";
import { AreaTrend, Bars, DualBars } from "@/components/charts/Trend";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { StatusDot } from "@/components/ui/Misc";
import { useToast } from "@/components/ui/Toast";
import { useBusinessData } from "@/lib/hooks/useBusinessData";
import { useDemoStore } from "@/lib/store/demoStore";
import { cn, formatPct, formatTime, relativeTime, siteUrl } from "@/lib/utils";

export default function ReviewCardPage() {
  return (
    <ClientOnly>
      <ReviewCardScreen />
    </ClientOnly>
  );
}

function ReviewCardScreen() {
  const d = useBusinessData();
  const { toast } = useToast();
  const setDest = useDemoStore((s) => s.setNfcDestination);
  const setStatus = useDemoStore((s) => s.setNfcStatus);
  const [qrOpen, setQrOpen] = useState(false);
  const [destOpen, setDestOpen] = useState(false);
  const [destType, setDestType] = useState<"google_review" | "custom">(d.reviewCard.destinationType);
  const [customUrl, setCustomUrl] = useState(d.reviewCard.destinationType === "custom" ? d.reviewCard.destinationUrl : "");

  const redirectUrl = `${siteUrl()}/r/${d.reviewCard.slug}`;
  const googleUrl = "https://search.google.com/local/writereview?placeid=ChIJdemoRoyalMassageSpa";
  const tapsDaily = d.dailyTaps.slice(-30).map((x) => ({ label: new Date(`${x.date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }), taps: x.taps }));
  const weekday = d.weekday.map((w) => ({ label: w.day, taps: Math.round(w.avg * 10) / 10 }));
  const peakIdx = weekday.reduce((best, w, i, arr) => (w.taps > arr[best].taps ? i : best), 0);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(redirectUrl);
      toast({ kind: "success", title: "Link copied", description: redirectUrl });
    } catch {
      toast({ kind: "error", title: "Couldn't copy" });
    }
  };

  const saveDestination = () => {
    const url = destType === "google_review" ? googleUrl : customUrl.trim();
    if (destType === "custom" && !/^https?:\/\//.test(url)) {
      toast({ kind: "error", title: "Enter a full URL", description: "Start with https://" });
      return;
    }
    setDest(destType, url);
    setDestOpen(false);
    toast({ kind: "success", title: "Destination updated", description: "Your physical card keeps working — no reprogramming needed." });
  };

  return (
    <>
      <PageHeader title="Review Card" subtitle="Your NFC review stand at the front desk, and what it's doing for you" />

      {/* Card status + controls */}
      <section className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <Card className="overflow-hidden">
          <div className="grid gap-0 md:grid-cols-[220px_1fr]">
            <div className="flex items-center justify-center gradient-brand p-6">
              <div className="relative aspect-[1.586] w-full max-w-[200px] rounded-2xl border border-white/20 bg-white/10 p-4 shadow-[var(--shadow-pop)] backdrop-blur">
                <div className="flex items-center justify-between">
                  <Nfc className="h-6 w-6 text-white" />
                  <StatusDot tone={d.reviewCard.status === "active" ? "success" : "warning"} pulse={d.reviewCard.status === "active"} />
                </div>
                <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300">Tap to review us</p>
                <p className="mt-0.5 text-[15px] font-bold text-white">Royal Massage &amp; Spa</p>
                <p className="mt-2 text-[10px] text-white/70">Powered by BoostReviews.AI</p>
              </div>
            </div>
            <div className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-ink">{d.reviewCard.label}</h3>
                <Badge tone={d.reviewCard.status === "active" ? "success" : "warning"} dot>
                  {d.reviewCard.status === "active" ? "Active" : "Paused"}
                </Badge>
              </div>
              <dl className="mt-4 space-y-3 text-[13.5px]">
                <div className="flex items-start gap-3">
                  <dt className="w-24 shrink-0 text-ink-subtle">Destination</dt>
                  <dd className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">{d.reviewCard.destinationType === "google_review" ? "Google review page" : "Custom link"}</p>
                    <p className="truncate text-[12px] text-ink-muted">{d.reviewCard.destinationUrl}</p>
                  </dd>
                </div>
                <div className="flex items-start gap-3">
                  <dt className="w-24 shrink-0 text-ink-subtle">Card link</dt>
                  <dd className="min-w-0 flex-1">
                    <p className="truncate font-mono text-[12.5px] text-ink">{redirectUrl}</p>
                    <p className="text-[12px] text-ink-muted">Programmed on the chip once. Change the destination any time — the chip never needs updating.</p>
                  </dd>
                </div>
                <div className="flex items-start gap-3">
                  <dt className="w-24 shrink-0 text-ink-subtle">Placement</dt>
                  <dd className="flex items-center gap-1.5 text-ink">
                    <MapPin className="h-3.5 w-3.5 text-ink-subtle" /> Front desk · checkout counter
                  </dd>
                </div>
              </dl>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setDestOpen(true)} icon={<Link2 className="h-4 w-4" />}>
                  Change destination
                </Button>
                <Button size="sm" variant="outline" onClick={copyLink} icon={<Copy className="h-4 w-4" />}>
                  Copy link
                </Button>
                <Button size="sm" variant="outline" onClick={() => setQrOpen(true)} icon={<QrCode className="h-4 w-4" />}>
                  View QR code
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const next = d.reviewCard.status === "active" ? "paused" : "active";
                    setStatus(next);
                    toast({ kind: "info", title: next === "active" ? "Card activated" : "Card paused", description: next === "active" ? "Taps redirect to your destination again." : "Taps will show a friendly 'temporarily unavailable' page." });
                  }}
                  icon={d.reviewCard.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                >
                  {d.reviewCard.status === "active" ? "Pause" : "Activate"}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
          <StatCard label="Taps this month" value={d.m30.nfcTaps} delta={d.m30.nfcChange} deltaFormat={(v) => formatPct(v, { sign: true })} deltaLabel="vs last month" compact />
          <StatCard label="Taps this week" value={d.taps7} delta={d.taps7Prev ? d.taps7 / d.taps7Prev - 1 : 0} deltaFormat={(v) => formatPct(v, { sign: true })} deltaLabel="vs prior week" compact />
          <StatCard label="Total taps" value={d.tapsTotal} deltaLabel={`since ${new Date(`${d.reviewCard.installedAt}T00:00:00`).toLocaleDateString("en-US", { month: "short", d: undefined, year: "numeric" } as Intl.DateTimeFormatOptions)}`} compact className="col-span-2 lg:col-span-1" />
        </div>
      </section>

      {/* Story */}
      <section className="mt-5 grid gap-4 md:grid-cols-3">
        <div className="card p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600">Is the card being used?</p>
          <p className="mt-2 text-[20px] font-extrabold leading-tight text-navy-900">Yes — {d.m30.nfcTaps} taps this month</p>
          <p className="mt-1.5 text-[13.5px] text-ink-muted">That&apos;s about {Math.round(d.m30.nfcTaps / 30)} customers a day tapping to leave a review, {formatPct(d.m30.nfcChange, { sign: true })} versus last month.</p>
        </div>
        <div className="card p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600">Taps → reviews</p>
          <p className="mt-2 text-[20px] font-extrabold leading-tight text-navy-900">About 1 in {Math.round(1 / Math.max(d.tapToReview, 0.01))} taps becomes a review</p>
          <p className="mt-1.5 text-[13.5px] text-ink-muted">{d.m30.reviewsGained} new reviews from {d.m30.nfcTaps} taps. Asking at checkout and pointing to the stand is the single biggest lever.</p>
        </div>
        <div className="card p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600">Peak days</p>
          <p className="mt-2 text-[20px] font-extrabold leading-tight text-navy-900">{weekday[peakIdx].label}s are busiest</p>
          <p className="mt-1.5 text-[13.5px] text-ink-muted">Averaging {weekday[peakIdx].taps} taps on {weekday[peakIdx].label}s. Make sure the stand is front and center on weekends.</p>
        </div>
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Tap trend" subtitle="Daily taps · last 30 days" />
          <CardBody className="pt-3">
            <AreaTrend data={tapsDaily} dataKey="taps" name="Taps" height={200} color="#14b1ef" />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Taps by day of week" subtitle="Average per day · last 30 days" />
          <CardBody className="pt-3">
            <Bars data={weekday} dataKey="taps" name="Avg taps" height={200} highlightIndex={peakIdx} color="#14b1ef" />
          </CardBody>
        </Card>
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader title="Taps vs. new reviews" subtitle="Weekly · last 12 weeks — review growth tracks card activity" />
          <CardBody className="pt-3">
            <DualBars data={d.weekly} keys={[{ key: "taps", name: "Taps", color: "#7ad9fb" }, { key: "reviews", name: "Reviews", color: "#1c74f5" }]} height={220} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Recent activity" subtitle="Live taps on your card" icon={<Smartphone className="h-4 w-4" />} />
          <CardBody className="pt-2">
            <ul className="divide-y divide-line">
              {d.tapEvents.slice(0, 8).map((t) => (
                <li key={t.id} className="flex items-center gap-3 py-2.5">
                  <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", t.source === "qr" ? "bg-sky-100 text-brand-700" : "bg-brand-50 text-brand-600")}>{t.source === "qr" ? <QrCode className="h-4 w-4" /> : <Nfc className="h-4 w-4" />}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-semibold text-ink">
                      {t.source === "qr" ? "QR scan" : "NFC tap"} · {t.device}
                    </p>
                    <p className="text-[12px] text-ink-subtle">
                      {relativeTime(new Date(t.timestamp))} · {formatTime(t.timestamp)}
                    </p>
                  </div>
                  <Check className="h-4 w-4 text-success-500" />
                </li>
              ))}
            </ul>
            <p className="mt-3 rounded-xl bg-canvas p-3 text-[12px] leading-snug text-ink-muted">
              <Sparkles className="mr-1 inline h-3.5 w-3.5 text-brand-600" />
              Try it: open the QR code and scan it with your phone. The tap shows up here.
            </p>
          </CardBody>
        </Card>
      </section>

      {/* QR modal */}
      <Modal open={qrOpen} onClose={() => setQrOpen(false)} title="Your review QR code" description="Points to the same redirect as the NFC chip. Print it for tables, receipts or the front window." size="sm">
        <div className="flex flex-col items-center">
          <div className="rounded-3xl border border-line bg-white p-5 shadow-[var(--shadow-card)]">
            <QRCodeSVG value={redirectUrl} size={220} level="M" bgColor="#ffffff" fgColor="#0b1533" imageSettings={{ src: "/brand/icon-512.png", height: 44, width: 44, excavate: true }} />
          </div>
          <p className="mt-4 break-all text-center font-mono text-[12px] text-ink-muted">{redirectUrl}</p>
          <div className="mt-4 flex w-full gap-2">
            <Button variant="outline" full onClick={copyLink} icon={<Copy className="h-4 w-4" />}>
              Copy link
            </Button>
            <Button full href={redirectUrl} icon={<ExternalLink className="h-4 w-4" />}>
              Test redirect
            </Button>
          </div>
        </div>
      </Modal>

      {/* Destination modal */}
      <Modal
        open={destOpen}
        onClose={() => setDestOpen(false)}
        title="Change destination"
        description="Where customers land after tapping the card. The physical chip never changes."
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDestOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveDestination}>Save destination</Button>
          </div>
        }
      >
        <div className="space-y-2">
          {(
            [
              { v: "google_review", title: "Google review page", desc: "Opens the 'Write a review' box for Royal Massage & Spa on Google. Recommended." },
              { v: "custom", title: "Custom link", desc: "Send taps somewhere else temporarily — a promotion, booking page or feedback form." },
            ] as const
          ).map((o) => (
            <button key={o.v} onClick={() => setDestType(o.v)} className={cn("flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-colors", destType === o.v ? "border-brand-400 bg-brand-50/60" : "border-line hover:border-line-strong")}>
              <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2", destType === o.v ? "border-brand-600 bg-brand-600 text-white" : "border-line-strong")}>{destType === o.v && <Check className="h-3 w-3" />}</span>
              <span>
                <span className="block text-[14px] font-semibold text-ink">{o.title}</span>
                <span className="block text-[12.5px] text-ink-muted">{o.desc}</span>
              </span>
            </button>
          ))}
          {destType === "custom" && (
            <input value={customUrl} onChange={(e) => setCustomUrl(e.target.value)} placeholder="https://" className="mt-1 h-11 w-full rounded-xl border border-line px-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" aria-label="Custom destination URL" />
          )}
        </div>
      </Modal>
    </>
  );
}
