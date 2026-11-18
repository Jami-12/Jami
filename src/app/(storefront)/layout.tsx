import Link from "next/link";
import { ArrowRight, Truck } from "lucide-react";

import { CartDrawer } from "@/components/layout/cart-drawer";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="bg-[#172B3A] text-[#F8F6F0] dark:bg-[#0B1720] dark:text-[#F3F2EC]">
        <div className="container-page flex h-9 items-center justify-between gap-3 text-[10px] font-medium uppercase tracking-[0.16em]">
          <p className="flex min-w-0 items-center gap-2">
            <Truck className="h-3.5 w-3.5 shrink-0 text-accent-300" aria-hidden="true" />
            <span className="truncate">
              Complimentary delivery over {formatCurrency(FREE_SHIPPING_THRESHOLD)}
            </span>
            <span aria-hidden="true" className="hidden text-[#6F8A8C] sm:inline">
              ·
            </span>
            <span className="hidden sm:inline">30-day returns</span>
          </p>
          <div className="hidden items-center gap-4 md:flex">
            <Link
              href="/account/orders"
              className="inline-flex items-center gap-1 hover:text-accent-200"
            >
              Track an order
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
            <Link href="/#contact" className="hover:text-accent-200">
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
