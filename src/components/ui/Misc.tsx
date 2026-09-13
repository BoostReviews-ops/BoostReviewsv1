"use client";

import { Info } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ProgressBar({ value, max = 100, tone = "brand", className, height = 8 }: { value: number; max?: number; tone?: "brand" | "success" | "warning" | "danger" | "navy" | "sky"; className?: string; height?: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const colors = {
    brand: "bg-brand-500",
    success: "bg-success-500",
    warning: "bg-warning-500",
    danger: "bg-danger-500",
    navy: "bg-navy-800",
    sky: "bg-sky-400",
  };
  return (
    <div className={cn("w-full overflow-hidden rounded-full bg-canvas ring-1 ring-inset ring-line", className)} style={{ height }} role="progressbar" aria-valuenow={value} aria-valuemax={max}>
      <div className={cn("h-full rounded-full transition-all duration-700 ease-out", colors[tone])} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Tooltip({ text, children, className }: { text: string; children?: React.ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className={cn("relative inline-flex", className)}>
      <button
        type="button"
        className="inline-flex items-center text-ink-subtle hover:text-brand-600 focus:outline-none"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        aria-label={text}
      >
        {children ?? <Info className="h-3.5 w-3.5" />}
      </button>
      {open && (
        <span role="tooltip" className="absolute left-1/2 top-full z-30 mt-1.5 w-56 -translate-x-1/2 rounded-xl bg-navy-900 px-3 py-2 text-left text-[12px] font-medium leading-snug text-white shadow-[var(--shadow-pop)] animate-fade-in">
          {text}
        </span>
      )}
    </span>
  );
}

export function EmptyState({ icon, title, description, action, className }: { icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-canvas/50 px-6 py-10 text-center", className)}>
      {icon && <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-[var(--shadow-card)]">{icon}</div>}
      <p className="text-[15px] font-semibold text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Avatar({ initials, className, tone = 0 }: { initials: string; className?: string; tone?: number }) {
  const palette = ["bg-brand-100 text-brand-700", "bg-sky-100 text-brand-700", "bg-navy-900 text-white", "bg-success-100 text-success-600", "bg-warning-100 text-warning-600"];
  return <span className={cn("inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-bold", palette[tone % palette.length], className)}>{initials}</span>;
}

export function StatusDot({ tone = "success", pulse }: { tone?: "success" | "warning" | "danger" | "neutral"; pulse?: boolean }) {
  const c = { success: "bg-success-500", warning: "bg-warning-500", danger: "bg-danger-500", neutral: "bg-ink-subtle" }[tone];
  return (
    <span className="relative inline-flex h-2.5 w-2.5">
      {pulse && <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-60", c)} />}
      <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", c)} />
    </span>
  );
}
