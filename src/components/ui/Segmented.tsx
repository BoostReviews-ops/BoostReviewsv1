"use client";

import { cn } from "@/lib/utils";

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
  size = "sm",
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; count?: number }[];
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <div className={cn("inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-xl bg-canvas p-1 ring-1 ring-inset ring-line scrollbar-none", className)} role="tablist">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-lg font-semibold transition-all whitespace-nowrap",
              size === "sm" ? "h-8 px-3 text-[13px]" : "h-9 px-3.5 text-sm",
              active ? "bg-white text-ink shadow-[0_1px_2px_rgba(11,21,51,0.08),0_2px_8px_-2px_rgba(11,21,51,0.12)]" : "text-ink-muted hover:text-ink",
            )}
          >
            {o.label}
            {typeof o.count === "number" && <span className={cn("rounded-md px-1.5 py-px text-[11px] tabular", active ? "bg-brand-50 text-brand-700" : "bg-white/70 text-ink-subtle")}>{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
