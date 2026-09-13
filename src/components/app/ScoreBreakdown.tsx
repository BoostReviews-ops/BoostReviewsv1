"use client";

import { Info } from "lucide-react";
import { AreaTrend } from "@/components/charts/Trend";
import { ScoreRing } from "@/components/charts/ScoreRing";
import { Delta } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/Misc";
import { useBusinessData } from "@/lib/hooks/useBusinessData";
import { cn, formatSigned } from "@/lib/utils";

export function ScoreBreakdownContent() {
  const d = useBusinessData();
  const history = d.scoreHistory.map((s) => ({ label: new Date(`${s.date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }), score: s.score }));
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
        <ScoreRing value={d.score.score} size={132} stroke={11} tone={d.score.category.tone} label={d.score.category.label} />
        <div className="flex-1 text-center sm:text-left">
          <p className="text-[13px] text-ink-muted">Was {d.score.previousScore} thirty days ago</p>
          <p className="mt-1 text-xl font-extrabold text-navy-900">
            {formatSigned(d.score.change)} points this month
          </p>
          <ul className="mt-3 space-y-1.5">
            {d.score.changeReasons.map((r) => (
              <li key={r.label} className="flex items-center justify-center gap-2 text-[14px] sm:justify-start">
                <span className={cn("w-9 rounded-md px-1.5 py-px text-center text-[12px] font-bold tabular", r.points > 0 ? "bg-success-100 text-success-600" : "bg-danger-100 text-danger-600")}>{formatSigned(r.points)}</span>
                <span className="text-ink">{r.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <p className="mb-2 text-[12px] font-bold uppercase tracking-wider text-ink-subtle">Score history · 26 weeks</p>
        <AreaTrend data={history} dataKey="score" height={160} domain={[60, 100]} name="Score" />
      </div>

      <div>
        <p className="mb-3 text-[12px] font-bold uppercase tracking-wider text-ink-subtle">What makes up your score</p>
        <ul className="space-y-3.5">
          {d.score.factors.map((f) => (
            <li key={f.key}>
              <div className="mb-1 flex items-center justify-between gap-3">
                <span className="text-[14px] font-semibold text-ink">{f.label}</span>
                <span className="flex items-center gap-2 text-[13px] tabular">
                  {f.delta !== 0 && <Delta value={f.delta} />}
                  <span className="font-semibold text-ink">
                    {f.points}<span className="text-ink-subtle">/{f.maxPoints}</span>
                  </span>
                </span>
              </div>
              <ProgressBar value={f.points} max={f.maxPoints} tone={f.points / f.maxPoints >= 0.8 ? "brand" : f.points / f.maxPoints >= 0.6 ? "sky" : "warning"} height={6} />
              <p className="mt-1 text-[12.5px] leading-snug text-ink-muted">{f.explanation}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl bg-canvas p-3.5 text-[12.5px] leading-snug text-ink-muted">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
        <p>
          The <strong className="text-ink">BoostReviews.AI Reputation Score</strong> is our proprietary 0–100 assessment of your online reputation. It blends nine signals from your Google reviews, response habits, profile health, review-card activity and local competitors. It is not a Google metric and is not endorsed by Google.
          Ranges: 90–100 Excellent · 80–89 Strong · 70–79 Good · 60–69 Needs Attention · below 60 At Risk.
        </p>
      </div>
    </div>
  );
}

export function ScoreBreakdownModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Reputation Score breakdown" description="Exactly what is helping and what is hurting" size="md">
      <ScoreBreakdownContent />
    </Modal>
  );
}
