import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Lightweight, text-based payment marks. Keeping them as styled type (instead
 * of remote logo images) avoids extra network requests and layout shift.
 */
const PAYMENT_METHODS = [
  { label: "Stripe", className: "border-[#635bff]/40 text-[#635bff]" },
  { label: "VISA", className: "border-[#1a1f71]/40 text-[#1a1f71] dark:border-[#8fa0ff]/50 dark:text-[#aab7ff] font-bold italic tracking-tight" },
  { label: "bKash", className: "border-[#e2136e]/40 text-[#e2136e]" },
  { label: "Nagad", className: "border-[#f36f21]/40 text-[#f36f21]" },
  { label: "COD", className: "border-border text-muted-foreground" },
] as const;

export function FooterBottom() {
  const year = new Date().getFullYear();

  return (
    <div className="mt-8">
      <Separator className="mb-5" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Secure checkout
          </span>
          {PAYMENT_METHODS.map((method) => (
            <span
              key={method.label}
              className={cn(
                "inline-flex h-6 items-center rounded-sm border bg-background px-2 text-[11px] font-semibold tracking-tight",
                method.className,
              )}
            >
              {method.label}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span>
            © {year} {SITE.name}
          </span>
          <Link
            href="/#privacy"
            className="underline-offset-4 transition hover:text-foreground hover:underline"
          >
            Privacy
          </Link>
          <Link
            href="/#terms"
            className="underline-offset-4 transition hover:text-foreground hover:underline"
          >
            Terms
          </Link>
          <a
            href={`mailto:${SITE.email}`}
            className="inline-flex items-center gap-1 underline-offset-4 transition hover:text-foreground hover:underline"
          >
            Contact
            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}
