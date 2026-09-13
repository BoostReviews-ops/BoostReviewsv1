"use client";

import { Inbox, Search, Star } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { ClientOnly, PageHeader } from "@/components/app/Common";
import { ReviewDetailModal, ReviewRow } from "@/components/app/ReviewRow";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState, ProgressBar } from "@/components/ui/Misc";
import { Segmented } from "@/components/ui/Segmented";
import { Stars } from "@/components/ui/Stars";
import { isAnswered, reviewsInWindow } from "@/lib/demo/analytics";
import { useBusinessData } from "@/lib/hooks/useBusinessData";
import type { Review } from "@/lib/types";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "unanswered" | "answered";
type SentimentFilter = "all" | "positive" | "negative";
type RatingFilter = "all" | "5" | "4" | "3" | "low";
type DateFilter = "30" | "90" | "365";

export default function ReviewsPage() {
  return (
    <ClientOnly>
      <Suspense>
        <Reviews />
      </Suspense>
    </ClientOnly>
  );
}

function Reviews() {
  const d = useBusinessData();
  const params = useSearchParams();
  const router = useRouter();
  const initialStatus = (params.get("filter") as StatusFilter) || "all";
  const [status, setStatus] = useState<StatusFilter>(["all", "unanswered", "answered"].includes(initialStatus) ? initialStatus : "all");
  const [sentiment, setSentiment] = useState<SentimentFilter>("all");
  const [rating, setRating] = useState<RatingFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("90");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Review | null>(null);

  const base = useMemo(() => reviewsInWindow(d.reviews, Number(dateFilter), 0), [d.reviews, dateFilter]);

  const filtered = useMemo(() => {
    return base.filter((r) => {
      if (status === "unanswered" && isAnswered(r)) return false;
      if (status === "answered" && !isAnswered(r)) return false;
      if (sentiment === "positive" && r.sentiment !== "positive") return false;
      if (sentiment === "negative" && r.sentiment === "positive") return false;
      if (rating === "5" && r.rating !== 5) return false;
      if (rating === "4" && r.rating !== 4) return false;
      if (rating === "3" && r.rating !== 3) return false;
      if (rating === "low" && r.rating > 2) return false;
      if (query && !(r.text + " " + r.reviewerName).toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [base, status, sentiment, rating, query]);

  const counts = {
    all: base.length,
    unanswered: base.filter((r) => !isAnswered(r)).length,
    answered: base.filter(isAnswered).length,
  };
  const dist = [5, 4, 3, 2, 1].map((s) => ({ star: s, count: base.filter((r) => r.rating === s).length }));
  const avg = base.length ? base.reduce((a, r) => a + r.rating, 0) / base.length : 0;

  // The active review must reflect live store edits.
  const activeLive = active ? (d.reviews.find((r) => r.id === active.id) ?? active) : null;

  return (
    <>
      <PageHeader title="Reviews" subtitle={`${d.totalReviews} Google reviews · ${d.googleRating.toFixed(1)} average rating`} />

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        {/* Summary + filters */}
        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <Card>
            <CardBody className="pt-5">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-[36px] font-extrabold leading-none tracking-tight text-navy-900 tabular">{avg.toFixed(1)}</p>
                  <Stars rating={avg} size={14} className="mt-1.5" />
                  <p className="mt-1 text-[12px] text-ink-subtle">{base.length} reviews · last {dateFilter === "365" ? "12 months" : `${dateFilter} days`}</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {dist.map((x) => (
                    <button key={x.star} onClick={() => setRating(rating === String(x.star) ? "all" : x.star <= 2 ? "low" : (String(x.star) as RatingFilter))} className="flex w-full items-center gap-2 text-[12px]">
                      <span className="flex w-6 items-center gap-0.5 font-semibold text-ink-muted tabular">
                        {x.star}
                        <Star className="h-3 w-3 fill-warning-500 text-warning-500" />
                      </span>
                      <ProgressBar value={x.count} max={Math.max(1, base.length)} tone={x.star >= 4 ? "success" : x.star === 3 ? "warning" : "danger"} height={6} className="flex-1" />
                      <span className="w-6 text-right text-ink-subtle tabular">{x.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-4 pt-5">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search reviews" className="h-10 w-full rounded-xl border border-line bg-canvas/60 pl-9 pr-3 text-sm outline-none focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100" aria-label="Search reviews" />
              </div>
              <Filter label="Status">
                <Segmented<StatusFilter>
                  value={status}
                  onChange={(v) => {
                    setStatus(v);
                    router.replace(v === "all" ? "/app/reviews" : `/app/reviews?filter=${v}`);
                  }}
                  options={[
                    { value: "all", label: "All", count: counts.all },
                    { value: "unanswered", label: "Unanswered", count: counts.unanswered },
                    { value: "answered", label: "Answered", count: counts.answered },
                  ]}
                />
              </Filter>
              <Filter label="Sentiment">
                <Segmented<SentimentFilter>
                  value={sentiment}
                  onChange={setSentiment}
                  options={[
                    { value: "all", label: "All" },
                    { value: "positive", label: "Positive" },
                    { value: "negative", label: "Negative / mixed" },
                  ]}
                />
              </Filter>
              <Filter label="Rating">
                <Segmented<RatingFilter>
                  value={rating}
                  onChange={setRating}
                  options={[
                    { value: "all", label: "All" },
                    { value: "5", label: "5★" },
                    { value: "4", label: "4★" },
                    { value: "3", label: "3★" },
                    { value: "low", label: "1–2★" },
                  ]}
                />
              </Filter>
              <Filter label="Date">
                <Segmented<DateFilter>
                  value={dateFilter}
                  onChange={setDateFilter}
                  options={[
                    { value: "30", label: "30 days" },
                    { value: "90", label: "90 days" },
                    { value: "365", label: "12 months" },
                  ]}
                />
              </Filter>
            </CardBody>
          </Card>
        </div>

        {/* List */}
        <Card>
          <CardBody className="pt-2">
            <div className="flex items-center justify-between px-1 pt-3 pb-1">
              <p className="text-[13px] font-semibold text-ink-muted">
                {filtered.length} review{filtered.length === 1 ? "" : "s"}
                {status === "unanswered" && filtered.length > 0 && <span className="ml-1.5 text-warning-600">· tap one to generate an AI reply</span>}
              </p>
            </div>
            {filtered.length === 0 ? (
              <EmptyState icon={<Inbox className="h-5 w-5" />} title={status === "unanswered" ? "Inbox zero — every review has a reply" : "No reviews match these filters"} description={status === "unanswered" ? "New reviews will appear here as they arrive. Keep replying within 24 hours." : "Try widening the date range or clearing a filter."} className="my-4" />
            ) : (
              <div className={cn("divide-y divide-line")}>
                {filtered.map((r) => (
                  <ReviewRow key={r.id} review={r} onOpen={() => setActive(r)} />
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {activeLive && <ReviewDetailModal key={activeLive.id + (activeLive.response?.date ?? "")} review={activeLive} open={!!active} onClose={() => setActive(null)} />}
    </>
  );
}

function Filter({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-subtle">{label}</p>
      {children}
    </div>
  );
}
