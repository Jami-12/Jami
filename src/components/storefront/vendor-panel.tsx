import Link from "next/link";
import { ArrowRight, BarChart3, Boxes, Receipt, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

const FEATURES = [
  { icon: Receipt, label: "Order pipeline", copy: "Track every order from checkout to delivery." },
  { icon: Boxes, label: "Live inventory", copy: "Stock adjustments with a complete movement log." },
  { icon: BarChart3, label: "Real numbers", copy: "Revenue, profit and expenses from the same source." },
  { icon: ShieldCheck, label: "Role aware", copy: "Customers, admins and super admins see only their scope." },
];

export function VendorPanel() {
  return (
    <section aria-labelledby="studio-heading" className="container-page py-14 sm:py-16">
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
        <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary-500 dark:text-accent-300">
              For the studio
            </p>
            <h2 id="studio-heading" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              A calm console for the people behind the objects.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              This storefront ships with a complete operations layer: catalog and image
              management, orders, inventory, coupons, reviews and accounting.
              Every action is audited, and every number comes from the live
              database — not a spreadsheet.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/admin">
                  Open admin console
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/super-admin">Accounting overview</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <div
                key={feature.label}
                className="rounded-2xl border border-border bg-background/60 p-4"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-accent-200">
                  <feature.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <h3 className="mt-3 text-sm font-bold">{feature.label}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {feature.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
