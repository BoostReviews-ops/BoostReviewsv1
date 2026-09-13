"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const tooltipStyle = {
  contentStyle: {
    borderRadius: 12,
    border: "1px solid #e5e9f2",
    boxShadow: "0 12px 32px -8px rgba(11,21,51,0.2)",
    fontSize: 12,
    padding: "8px 12px",
  },
  labelStyle: { color: "#5b6785", fontWeight: 600, marginBottom: 4 },
  itemStyle: { color: "#0b1533", fontWeight: 600, padding: 0 },
};

/** Area trend — one series over time (score history, taps, etc.). */
export function AreaTrend({
  data,
  dataKey,
  xKey = "label",
  color = "#1c74f5",
  height = 200,
  domain,
  formatter,
  name,
}: {
  data: Record<string, unknown>[];
  dataKey: string;
  xKey?: string;
  color?: string;
  height?: number;
  domain?: [number | "auto", number | "auto"];
  formatter?: (v: number) => string;
  name?: string;
}) {
  const id = `area-${dataKey}-${color.replace("#", "")}`;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#eef1f7" />
        <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} interval="preserveStartEnd" minTickGap={24} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} domain={domain ?? ["auto", "auto"]} width={36} />
        <Tooltip {...tooltipStyle} formatter={(v) => [formatter ? formatter(Number(v)) : v, name ?? dataKey]} />
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} fill={`url(#${id})`} dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }} isAnimationActive />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Bars — e.g. reviews per month, taps per weekday. Highlights the last bar. */
export function Bars({
  data,
  dataKey,
  xKey = "label",
  color = "#1c74f5",
  highlightLast = true,
  highlightIndex,
  height = 180,
  formatter,
  name,
  radius = 6,
}: {
  data: Record<string, unknown>[];
  dataKey: string;
  xKey?: string;
  color?: string;
  highlightLast?: boolean;
  highlightIndex?: number;
  height?: number;
  formatter?: (v: number) => string;
  name?: string;
  radius?: number;
}) {
  const hi = highlightIndex ?? (highlightLast ? data.length - 1 : -1);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: -14, bottom: 0 }} barCategoryGap="28%">
        <CartesianGrid vertical={false} stroke="#eef1f7" />
        <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} interval={0} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} width={36} allowDecimals={false} />
        <Tooltip {...tooltipStyle} cursor={{ fill: "rgba(28,116,245,0.06)" }} formatter={(v) => [formatter ? formatter(Number(v)) : v, name ?? dataKey]} />
        <Bar dataKey={dataKey} radius={[radius, radius, radius, radius]} isAnimationActive>
          {data.map((_, i) => (
            <Cell key={i} fill={i === hi ? color : "#c9dcfb"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Two series compared side by side (e.g., taps vs reviews per week). */
export function DualBars({
  data,
  keys,
  xKey = "label",
  height = 200,
}: {
  data: Record<string, unknown>[];
  keys: { key: string; name: string; color: string }[];
  xKey?: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: -14, bottom: 0 }} barCategoryGap="22%" barGap={3}>
        <CartesianGrid vertical={false} stroke="#eef1f7" />
        <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} minTickGap={16} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} width={36} allowDecimals={false} />
        <Tooltip {...tooltipStyle} cursor={{ fill: "rgba(28,116,245,0.06)" }} />
        {keys.map((k) => (
          <Bar key={k.key} dataKey={k.key} name={k.name} fill={k.color} radius={[5, 5, 5, 5]} maxBarSize={22} isAnimationActive />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
