"use client";

import { ArrowRight, Check, Clock, Undo2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { useDemoStore } from "@/lib/store/demoStore";
import type { RecommendedAction } from "@/lib/types";
import { cn, relativeTime } from "@/lib/utils";

export function ActionCard({ action, index, showUndo }: { action: RecommendedAction; index?: number; showUndo?: boolean }) {
  const complete = useDemoStore((s) => s.completeAction);
  const uncomplete = useDemoStore((s) => s.uncompleteAction);
  const { toast } = useToast();
  const done = !!action.completedAt;
  const impact = { high: "danger", medium: "warning", low: "neutral" } as const;

  return (
    <div className={cn("flex flex-col rounded-2xl border bg-white p-4 transition-all", done ? "border-line opacity-80" : "border-line hover:border-brand-100 hover:shadow-[var(--shadow-card)]")}>
      <div className="flex items-start gap-3">
        {typeof index === "number" && !done && <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-[12px] font-bold text-white">{index}</span>}
        {done && (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-success-100 text-success-600">
            <Check className="h-4 w-4" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className={cn("text-[14.5px] font-semibold leading-snug text-ink", done && "line-through decoration-ink-subtle")}>{action.title}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Badge tone={impact[action.impact]}>{action.impact} impact</Badge>
            <Badge>
              <Clock className="h-3 w-3" /> {action.effort}
            </Badge>
            {done && action.completedAt && <span className="text-[12px] text-ink-subtle">Done {relativeTime(new Date(action.completedAt))}</span>}
          </div>
        </div>
      </div>
      <p className="mt-3 text-[13px] leading-snug text-ink-muted">
        <span className="font-semibold text-ink">Why:</span> {action.why}
      </p>
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
        {!done ? (
          <>
            <Link href={action.href} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-600 px-3 text-[13px] font-semibold text-white hover:bg-brand-700">
              {action.cta} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <button
              onClick={() => {
                complete(action.id);
                toast({ kind: "success", title: "Marked complete", description: "Nice — this will show in your monthly report." });
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-ink-muted hover:bg-canvas hover:text-ink"
            >
              <Check className="h-3.5 w-3.5" /> Mark complete
            </button>
          </>
        ) : (
          showUndo && (
            <button onClick={() => uncomplete(action.id)} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-ink-muted hover:bg-canvas hover:text-ink">
              <Undo2 className="h-3.5 w-3.5" /> Undo
            </button>
          )
        )}
      </div>
    </div>
  );
}
