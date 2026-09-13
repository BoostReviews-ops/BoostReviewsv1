import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "brand" | "navy" | "success" | "warning" | "danger" | "neutral" | "sky";

const tones: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-700 ring-brand-100",
  navy: "bg-navy-900 text-white ring-navy-900",
  success: "bg-success-100 text-success-600 ring-success-100",
  warning: "bg-warning-100 text-warning-600 ring-warning-100",
  danger: "bg-danger-100 text-danger-600 ring-danger-100",
  neutral: "bg-canvas text-ink-muted ring-line",
  sky: "bg-sky-100 text-brand-700 ring-sky-100",
};

export function Badge({ tone = "neutral", className, children, dot }: { tone?: Tone; className?: string; children: React.ReactNode; dot?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-semibold ring-1 ring-inset whitespace-nowrap", tones[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/** Delta pill: green up, red down, gray flat. `invert` when lower is better. */
export function Delta({ value, suffix = "", className, invert = false, format }: { value: number; suffix?: string; className?: string; invert?: boolean; format?: (v: number) => string }) {
  const good = invert ? value < 0 : value > 0;
  const bad = invert ? value > 0 : value < 0;
  const label = format ? format(value) : `${value > 0 ? "+" : value < 0 ? "−" : ""}${Math.abs(value)}${suffix}`;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[12px] font-semibold tabular",
        good && "bg-success-100 text-success-600",
        bad && "bg-danger-100 text-danger-600",
        !good && !bad && "bg-canvas text-ink-muted",
        className,
      )}
    >
      {value > 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : value < 0 ? <ArrowDownRight className="h-3.5 w-3.5" /> : <Minus className="h-3 w-3" />}
      {label}
    </span>
  );
}
