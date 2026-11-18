import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { SITE } from "@/lib/constants";

const PAYMENT_METHODS = ["Stripe", "Visa", "bKash", "Nagad", "COD"];

export function FooterBottom() {
  return (
    <div className="mt-12 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Secure checkout</span>
        {PAYMENT_METHODS.map((method) => (
          <Badge key={method} tone="neutral" className="normal-case tracking-normal">
            {method}
          </Badge>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} Aether Atelier</span>
        <Link href="/#privacy" className="hover:text-foreground">
          Privacy
        </Link>
        <Link href="/#terms" className="hover:text-foreground">
          Terms
        </Link>
        <a
          href={`mailto:${SITE.email}`}
          className="inline-flex items-center gap-1 hover:text-foreground"
        >
          Contact
          <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
