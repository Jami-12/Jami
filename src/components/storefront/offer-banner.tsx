import Link from "next/link";
import { ArrowRight, Gift, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export function OfferBanner() {
  return (
    <section aria-labelledby="offer-heading" className="container-page py-6">
      <div className="relative overflow-hidden rounded-none border border-foreground bg-foreground px-6 py-10 text-background sm:px-10 sm:py-12">
        <div className="relative grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-none border border-background/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-background">
              <Gift className="h-3.5 w-3.5" aria-hidden="true" />
              Studio week
            </p>
            <h2 id="offer-heading" className="mt-4 max-w-xl text-2xl font-semibold tracking-tight sm:text-4xl">
              Complimentary delivery on orders over{" "}
              {formatCurrency(FREE_SHIPPING_THRESHOLD)}.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-background/75">
              Add a note at checkout and we&apos;ll wrap it by hand. Applies to
              standard delivery within Bangladesh — no code required.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button asChild variant="secondary" size="lg" className="border border-background hover:bg-background hover:text-foreground">
                <Link href="/products">
                  Find something good
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <span className="inline-flex items-center gap-2 text-xs font-medium text-background/75">
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
                className="rounded-none border border-background/30 p-4"
              >
                <dt className="text-xl font-extrabold tracking-tight text-background">
                  {item.value}
                </dt>
                <dd className="mt-1 text-[11px] leading-snug text-background/70">
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
