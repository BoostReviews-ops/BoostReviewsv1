import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * BoostReviewsAI lockup: the exact "b" icon cropped from the supplied logo file
 * (never redrawn) plus the wordmark set in type so it reads "boostreviewsai",
 * matching the domain boostreviewsai.com. Colors are sampled from the logo:
 * navy #010C2F, blue #006CFE.
 */
export function Logo({
  className,
  height = 36,
  href = "/",
  priority = false,
  onDark = false,
  iconOnly = false,
}: {
  className?: string;
  height?: number;
  href?: string | null;
  priority?: boolean;
  onDark?: boolean;
  iconOnly?: boolean;
}) {
  const iconH = Math.round(height * 0.86);
  const iconW = Math.round(iconH * 0.8);
  const fontSize = Math.round(height * 0.6);
  const inner = (
    <span className={cn("inline-flex items-center gap-[0.32em] whitespace-nowrap", className)} style={{ height, fontSize }}>
      <Image src="/brand/icon-512.png" alt="" width={iconW} height={iconH} priority={priority} className="select-none" style={{ height: iconH, width: "auto" }} />
      {!iconOnly && (
        <span className="font-extrabold leading-none tracking-[-0.03em]" style={{ fontSize }} aria-hidden={false}>
          <span style={{ color: onDark ? "#ffffff" : "#010C2F" }}>boost</span>
          <span style={{ color: "#006CFE" }}>reviews</span>
          <span style={{ color: onDark ? "#ffffff" : "#010C2F" }}>ai</span>
        </span>
      )}
      <span className="sr-only">BoostReviewsAI</span>
    </span>
  );
  if (href === null) return inner;
  return (
    <Link href={href} className="inline-flex items-center" aria-label="BoostReviewsAI home">
      {inner}
    </Link>
  );
}
