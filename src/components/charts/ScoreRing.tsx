"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const toneColor: Record<string, string> = {
  excellent: "#16a34a",
  strong: "#1c74f5",
  good: "#14b1ef",
  attention: "#d97706",
  risk: "#dc2626",
};

/**
 * Animated score ring with gradient stroke. The centerpiece visual.
 */
export function ScoreRing({
  value,
  max = 100,
  size = 200,
  stroke = 14,
  tone = "strong",
  label,
  sublabel,
  className,
  children,
}: {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  tone?: "excellent" | "strong" | "good" | "attention" | "risk";
  label?: React.ReactNode;
  sublabel?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const t = requestAnimationFrame(() => setAnimated(value));
    return () => cancelAnimationFrame(t);
  }, [value]);

  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, animated / max));
  const offset = c * (1 - pct);
  const color = toneColor[tone];
  const id = `ring-${tone}`;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }} role="img" aria-label={`${value} out of ${max}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0b1533" />
            <stop offset="55%" stopColor={color} />
            <stop offset="100%" stopColor="#3ec5f7" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e9f2" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children ?? (
          <>
            <span className="text-[44px] font-extrabold leading-none tracking-tight text-navy-900 tabular" style={{ fontSize: size * 0.22 }}>
              {value}
            </span>
            {label && <span className="mt-1 text-[12px] font-bold uppercase tracking-wider" style={{ color }}>{label}</span>}
            {sublabel && <span className="mt-0.5 text-[11px] text-ink-subtle">{sublabel}</span>}
          </>
        )}
      </div>
    </div>
  );
}

/** Small ring for secondary scores (e.g., Profile Health). */
export function MiniRing({ value, size = 56, stroke = 6, tone = "strong" }: { value: number; size?: number; stroke?: number; tone?: keyof typeof toneColor }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e9f2" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={toneColor[tone]} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
      </svg>
      <span className="absolute text-[13px] font-bold text-navy-900 tabular">{value}</span>
    </div>
  );
}
