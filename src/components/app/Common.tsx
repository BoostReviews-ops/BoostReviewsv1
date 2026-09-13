"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Sparkline } from "@/components/charts/Sparkline";
import { Delta } from "@/components/ui/Badge";
import { Segmented } from "@/components/ui/Segmented";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { Tooltip } from "@/components/ui/Misc";
import { useDemoStore } from "@/lib/store/demoStore";
import type { DateRangeKey } from "@/lib/types";
import { cn } from "@/lib/utils";

const subscribeNoop = () => () => {};

/** Renders children only after the demo store has hydrated from localStorage. */
export function ClientOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const hydrated = useDemoStore((s) => s.hydrated);
  // false on the server and during hydration, true after mount — no setState needed.
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  useEffect(() => {
    // If persist has nothing stored, onRehydrateStorage still fires; guard anyway.
    const t = setTimeout(() => useDemoStore.getState().setHydrated(), 400);
    return () => clearTimeout(t);
  }, []);
  if (!mounted || !hydrated) return <>{fallback ?? <PageSkeleton />}</>;
  return <div className="animate-fade-in">{children}</div>;
}

export function PageHeader({ title, subtitle, action, className }: { title: React.ReactNode; subtitle?: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        <h1 className="text-[22px] font-extrabold tracking-tight text-navy-900 sm:text-[26px]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-muted sm:text-[15px]">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function RangePicker({ className }: { className?: string }) {
  const value = useDemoStore((s) => s.dateRange);
  const set = useDemoStore((s) => s.setDateRange);
  return (
    <Segmented<DateRangeKey>
      className={className}
      value={value}
      onChange={set}
      options={[
        { value: "7d", label: "7d" },
        { value: "30d", label: "30d" },
        { value: "90d", label: "90d" },
        { value: "12m", label: "12m" },
      ]}
    />
  );
}

export function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  deltaFormat,
  hint,
  href,
  spark,
  sparkColor,
  className,
  compact,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  delta?: number;
  deltaLabel?: string;
  deltaFormat?: (v: number) => string;
  hint?: string;
  href?: string;
  spark?: number[];
  sparkColor?: string;
  className?: string;
  compact?: boolean;
  icon?: React.ReactNode;
}) {
  const inner = (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-ink-subtle">
          {icon}
          {label}
          {hint && <Tooltip text={hint} />}
        </p>
        {href && <ChevronRight className="h-4 w-4 text-ink-subtle" />}
      </div>
      <div className={cn("mt-2 flex items-end justify-between gap-2", compact && "mt-1.5")}>
        <div className="min-w-0">
          <p className={cn("font-extrabold tracking-tight text-navy-900 tabular leading-none", compact ? "text-[24px]" : "text-[28px] sm:text-[32px]")}>{value}</p>
          {(typeof delta === "number" || deltaLabel) && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {typeof delta === "number" && <Delta value={delta} format={deltaFormat} />}
              {deltaLabel && <span className="text-[12px] text-ink-muted">{deltaLabel}</span>}
            </div>
          )}
        </div>
        {spark && <Sparkline data={spark} color={sparkColor} width={72} height={26} className="shrink-0 self-end" />}
      </div>
    </>
  );
  const cls = cn("card block p-4 sm:p-5", href && "card-hover", className);
  if (href)
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  return <div className={cls}>{inner}</div>;
}
