import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPct(fraction: number, opts: { sign?: boolean; digits?: number } = {}) {
  const v = fraction * 100;
  const s = `${Math.abs(v).toFixed(opts.digits ?? 0)}%`;
  if (opts.sign) return v > 0 ? `+${s}` : v < 0 ? `−${s}` : s;
  return s;
}

export function formatSigned(n: number) {
  return n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : "0";
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

export function formatDate(iso: string, style: "short" | "long" | "relative" = "short") {
  const d = new Date(iso);
  if (style === "long") return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  if (style === "relative") return relativeTime(d);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function relativeTime(d: Date) {
  const diff = Math.max(0, Date.now() - d.getTime());
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr${h === 1 ? "" : "s"} ago`;
  const days = Math.round(h / 24);
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

/** Public base URL of this deployment (used for NFC redirect links & QR). */
export function siteUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
