import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SITE } from "@/lib/constants";

const PAYMENT_METHODS = ["Stripe", "Visa", "bKash", "Nagad", "COD"];

export function FooterBottom() {
  const year = new Date().getFullYear();

  return (
    <div className="mt-12">
      <Separator className="mb-6" />
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold text-muted-foreground">
            Secure checkout
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {PAYMENT_METHODS.map((method) => (
              <Badge
                key={method}
                tone="neutral"
                className="normal-case tracking-normal"
              >
                {method}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span>
            © {year} {SITE.name}
          </span>
          <Link href="/#privacy" className="transition hover:text-foreground">
            Privacy
          </Link>
          <Link href="/#terms" className="transition hover:text-foreground">
            Terms
          </Link>
          <a
            href={`mailto:${SITE.email}`}
            className="inline-flex items-center gap-1 transition hover:text-foreground"
          >
            Contact
            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}
