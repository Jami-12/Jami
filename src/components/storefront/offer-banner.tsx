import Link from "next/link";
import { ArrowRight, Gift, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export function OfferBanner() {
  return (
    <section aria-labelledby="offer-heading" className="container-page py-6">
      <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-10 text-primary-foreground shadow-lift sm:px-10 sm:py-12">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,color-mix(in_srgb,var(--primary-foreground)_18%,transparent),transparent_45%),radial-gradient(circle_at_85%_80%,color-mix(in_srgb,var(--primary-foreground)_12%,transparent),transparent_45%)]"
        />
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-28 -left-16 h-64 w-64 rounded-full border border-white/10"
        />
        <div className="relative grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-foreground">
              <Gift className="h-3.5 w-3.5" aria-hidden="true" />
              Studio week
            </p>
            <h2 id="offer-heading" className="mt-4 max-w-xl text-2xl font-semibold tracking-tight sm:text-4xl">
              Complimentary delivery on orders over{" "}
              {formatCurrency(FREE_SHIPPING_THRESHOLD)}.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-primary-foreground/80">
              Add a note at checkout and we&apos;ll wrap it by hand. Applies to
              standard delivery within Bangladesh — no code required.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button asChild variant="secondary" size="lg">
                <Link href="/products">
                  Find something good
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <span className="inline-flex items-center gap-2 text-xs font-medium text-primary-foreground/75">
                <Truck className="h-4 w-4" aria-hidden="true" />
                Free returns within 30 days
              </span>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-3">
            {[
              { value: "48h", label: "Dispatch for in-stock pieces" },
              { value: "4.9/5", label: "Average verified rating" },
              { value: "100%", label: "Recyclable packaging" },
              { value: "2 yr", label: "Materials warranty" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-4 backdrop-blur"
              >
                <dt className="text-xl font-extrabold tracking-tight text-primary-foreground">
                  {item.value}
                </dt>
                <dd className="mt-1 text-[11px] leading-snug text-primary-foreground/70">
                  {item.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
