"use client";

import { Check, Copy, MessageSquareReply, Pencil, Send, Sparkles, WandSparkles } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Misc";
import { Stars } from "@/components/ui/Stars";
import { useToast } from "@/components/ui/Toast";
import { draftReplyDemo } from "@/lib/ai/demo";
import { THEME_LABELS } from "@/lib/demo/reviewBank";
import { useDemoStore } from "@/lib/store/demoStore";
import type { Review } from "@/lib/types";
import { cn, formatDate, relativeTime } from "@/lib/utils";

const BUSINESS_NAME = "Royal Massage & Spa";

function sentimentTone(r: Review) {
  return r.sentiment === "positive" ? "success" : r.sentiment === "neutral" ? "warning" : "danger";
}

export function ReviewRow({ review, compact, onOpen }: { review: Review; compact?: boolean; onOpen?: () => void }) {
  const [open, setOpen] = useState(false);
  const answered = !!review.response && (review.response.status === "responded" || review.response.status === "approved");
  const draft = review.response?.status === "draft";
  const tone = review.reviewerName.charCodeAt(0) % 5;
  return (
    <>
      <button onClick={() => (onOpen ? onOpen() : setOpen(true))} className="-mx-2 flex w-[calc(100%+1rem)] items-start gap-3 rounded-xl px-2 py-3.5 text-left transition-colors hover:bg-canvas">
        <Avatar initials={review.reviewerInitials} tone={tone} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[14px] font-semibold text-ink">{review.reviewerName}</span>
            <Stars rating={review.rating} size={13} />
            <span className="text-[12px] text-ink-subtle">{relativeTime(new Date(review.date))}</span>
          </div>
          <p className={cn("mt-1 text-[13.5px] leading-snug text-ink-muted", compact ? "line-clamp-2" : "line-clamp-3")}>{review.text}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {answered ? (
              <Badge tone="success">
                <Check className="h-3 w-3" /> Replied{review.response?.aiAssisted ? " · AI-assisted" : ""}
              </Badge>
            ) : draft ? (
              <Badge tone="brand">
                <Pencil className="h-3 w-3" /> Draft saved
              </Badge>
            ) : (
              <Badge tone="warning" dot>
                Needs reply
              </Badge>
            )}
            {!compact && <Badge tone={sentimentTone(review)}>{review.sentiment}</Badge>}
            {!compact && review.themes.slice(0, 2).map((t) => <Badge key={t}>{THEME_LABELS[t]?.label ?? t}</Badge>)}
          </div>
        </div>
      </button>
      {!onOpen && <ReviewDetailModal review={review} open={open} onClose={() => setOpen(false)} />}
    </>
  );
}

/* ------------------------------------------------------------------ */

export function ReviewDetailModal({ review, open, onClose }: { review: Review; open: boolean; onClose: () => void }) {
  const saveReply = useDemoStore((s) => s.saveReply);
  const deleteReply = useDemoStore((s) => s.deleteReply);
  const { toast } = useToast();
  const answered = !!review.response && (review.response.status === "responded" || review.response.status === "approved");
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(review.response?.text ?? "");
  const [generating, setGenerating] = useState(false);
  const [aiUsed, setAiUsed] = useState(review.response?.aiAssisted ?? false);

  const generate = async () => {
    setGenerating(true);
    let draft = "";
    try {
      const res = await fetch("/api/ai/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName: BUSINESS_NAME, review: { reviewerName: review.reviewerName, rating: review.rating, text: review.text, themes: review.themes } }),
      });
      if (res.ok) draft = ((await res.json()) as { text: string }).text;
    } catch {
      /* fall through to local demo generator */
    }
    if (!draft) draft = draftReplyDemo({ businessName: BUSINESS_NAME, review });
    // Simulate a short "thinking" moment so the interaction feels real
    await new Promise((r) => setTimeout(r, 650));
    setText(draft);
    setAiUsed(true);
    setEditing(true);
    setGenerating(false);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ kind: "success", title: "Reply copied to clipboard" });
    } catch {
      toast({ kind: "error", title: "Couldn't copy", description: "Select the text and copy manually." });
    }
  };

  const saveDraft = () => {
    saveReply(review.id, text, "draft", aiUsed);
    setEditing(false);
    toast({ kind: "info", title: "Draft saved", description: "You can approve and submit it any time." });
  };

  const approve = () => {
    if (!text.trim()) return;
    saveReply(review.id, text.trim(), "responded", aiUsed);
    setEditing(false);
    toast({ kind: "success", title: "Reply submitted (demo)", description: "In production this publishes to Google after your approval." });
  };

  const undo = () => {
    deleteReply(review.id);
    setText("");
    setEditing(false);
    toast({ kind: "info", title: "Reply removed" });
  };

  return (
    <Modal open={open} onClose={onClose} title={review.reviewerName} description={`${formatDate(review.date, "long")} · Google review`} size="md">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Stars rating={review.rating} size={16} />
          <Badge tone={sentimentTone(review)}>{review.sentiment} sentiment</Badge>
          {review.themes.map((t) => (
            <Badge key={t}>{THEME_LABELS[t]?.label ?? t}</Badge>
          ))}
        </div>
        <p className="text-[15px] leading-relaxed text-ink">{review.text}</p>

        {/* Existing reply */}
        {answered && !editing && review.response && (
          <div className="rounded-2xl border border-line bg-canvas/70 p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-ink-subtle">
                <MessageSquareReply className="h-3.5 w-3.5" /> Your reply · {formatDate(review.response.date)}
              </p>
              {review.response.aiAssisted && (
                <Badge tone="brand">
                  <Sparkles className="h-3 w-3" /> AI-assisted
                </Badge>
              )}
            </div>
            <p className="text-[14px] leading-relaxed text-ink">{review.response.text}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => setEditing(true)}>
                Edit
              </Button>
              <Button size="sm" variant="ghost" onClick={undo}>
                Remove reply
              </Button>
            </div>
          </div>
        )}

        {/* Composer */}
        {(!answered || editing) && (
          <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-brand-700">
                <Sparkles className="h-3.5 w-3.5" /> {editing && text ? (aiUsed ? "AI-drafted reply · edit before sending" : "Your reply") : "Reply to this review"}
              </p>
              {review.response?.status === "draft" && <Badge tone="brand">Draft</Badge>}
            </div>
            {!text && !generating ? (
              <div className="flex flex-col items-start gap-3">
                <p className="text-[13.5px] text-ink-muted">Let BoostReviews.AI draft a personal reply that references what {review.reviewerName.split(" ")[0]} actually wrote. You always review it before it goes anywhere.</p>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={generate} icon={<WandSparkles className="h-4 w-4" />}>
                    Generate AI reply
                  </Button>
                  <Button variant="outline" onClick={() => setEditing(true)}>
                    Write my own
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {generating ? (
                  <div className="space-y-2 py-1" aria-busy>
                    <div className="skeleton h-3.5 w-11/12" />
                    <div className="skeleton h-3.5 w-full" />
                    <div className="skeleton h-3.5 w-3/4" />
                    <p className="pt-1 text-[12px] font-medium text-brand-600 animate-pulse-soft">Reading the review and drafting a reply…</p>
                  </div>
                ) : (
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={5}
                    className="w-full resize-y rounded-xl border border-line bg-white p-3 text-[14px] leading-relaxed text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                    placeholder="Write your reply…"
                    aria-label="Reply text"
                  />
                )}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button onClick={approve} disabled={generating || !text.trim()} icon={<Send className="h-4 w-4" />}>
                    Approve &amp; submit
                  </Button>
                  <Button variant="outline" onClick={saveDraft} disabled={generating || !text.trim()}>
                    Save draft
                  </Button>
                  <Button variant="ghost" onClick={copy} disabled={generating || !text.trim()} icon={<Copy className="h-4 w-4" />}>
                    Copy
                  </Button>
                  <Button variant="ghost" onClick={generate} disabled={generating} icon={<WandSparkles className="h-4 w-4" />}>
                    Regenerate
                  </Button>
                </div>
                <p className="mt-2.5 text-[12px] text-ink-subtle">Demo mode: replies are saved locally. Production publishes to Google only after you approve.</p>
              </>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
