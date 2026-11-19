import Link from "next/link";
import { ArrowRight, Truck } from "lucide-react";

import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { Navbar } from "@/components/navbar";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="border-b border-primary-900/40 bg-primary-950 text-primary-50 dark:border-border dark:bg-[#0B1720] dark:text-foreground">
        <div className="container-page flex h-9 items-center justify-between gap-3 text-[10px] font-medium uppercase tracking-[0.16em]">
          <p className="flex min-w-0 items-center gap-2">
            <Truck className="h-3.5 w-3.5 shrink-0 text-accent-300" aria-hidden="true" />
            <span className="truncate">
              Complimentary delivery over {formatCurrency(FREE_SHIPPING_THRESHOLD)}
            </span>
            <span aria-hidden="true" className="hidden text-primary-300 sm:inline">
              ·
            </span>
            <span className="hidden text-primary-200 sm:inline">30-day returns</span>
          </p>
          <div className="hidden items-center gap-4 md:flex">
            <Link
              href="/account/orders"
              className="inline-flex items-center gap-1 text-primary-100 transition hover:text-accent-200"
            >
              Track an order
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
            <Link
              href="/#contact"
              className="text-primary-100 transition hover:text-accent-200"
            >
              Client care
            </Link>
          </div>
        </div>
      </div>
      <Navbar />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
