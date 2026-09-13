import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Card({ className, children, hover, as: Tag = "div", ...rest }: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean; as?: "div" | "section" | "article" }) {
  return (
    <Tag className={cn("card", hover && "card-hover", className)} {...rest}>
      {children}
    </Tag>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  href,
  icon,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  href?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3 px-5 pt-5 sm:px-6 sm:pt-6", className)}>
      <div className="flex min-w-0 items-start gap-3">
        {icon && <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">{icon}</div>}
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold leading-tight text-ink sm:text-base">{title}</h3>
          {subtitle && <p className="mt-1 text-[13px] leading-snug text-ink-muted">{subtitle}</p>}
        </div>
      </div>
      {action}
      {!action && href && (
        <Link href={href} className="inline-flex h-8 shrink-0 items-center gap-0.5 rounded-lg px-2 text-[13px] font-semibold text-brand-600 hover:bg-brand-50">
          View <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

export function CardBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("px-5 pb-5 pt-4 sm:px-6 sm:pb-6", className)}>{children}</div>;
}

export function SectionTitle({ eyebrow, title, subtitle, className }: { eyebrow?: string; title: React.ReactNode; subtitle?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mb-4", className)}>
      {eyebrow && <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-600">{eyebrow}</p>}
      <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-ink-muted sm:text-[15px]">{subtitle}</p>}
    </div>
  );
}
