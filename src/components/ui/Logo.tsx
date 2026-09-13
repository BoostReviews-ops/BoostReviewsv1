import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The official BoostReviews.AI logo — a locked brand asset.
 * Always rendered from the supplied PNG; never redrawn or replaced with text.
 * The asset has a navy wordmark, so it is always placed on a light surface.
 * `boostreviews-logo-trimmed.png` is the same asset with its transparent
 * margins cropped so it renders at full size; proportions are untouched.
 */
export function Logo({ className, height = 36, href = "/", priority = false }: { className?: string; height?: number; href?: string | null; priority?: boolean }) {
  const width = Math.round(height * 2.195); // trimmed asset aspect ratio
  const img = (
    <Image
      src="/brand/boostreviews-logo-trimmed.png"
      alt="BoostReviews.AI"
      width={width}
      height={height}
      priority={priority}
      className={cn("h-auto w-auto select-none", className)}
      style={{ height, width: "auto" }}
    />
  );
  if (href === null) return img;
  return (
    <Link href={href} className="inline-flex items-center" aria-label="BoostReviews.AI home">
      {img}
    </Link>
  );
}
