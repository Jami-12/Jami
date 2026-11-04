import { CartDrawer } from "@/components/layout/cart-drawer";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Truck } from "lucide-react";
import Link from "next/link";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="bg-primary-900 text-primary-50 dark:bg-primary-950">
        <div className="container-page flex h-9 items-center justify-between gap-3 text-[11px] font-medium">
          <p className="flex min-w-0 items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 shrink-0 text-accent-300" aria-hidden="true" />
            <span className="truncate">
              Free carbon-neutral shipping over $150 · 30-day returns
            </span>
          </p>
          <div className="hidden items-center gap-4 md:flex">
            <Link href="/account?tab=orders" className="hover:text-accent-200">
              Track an order
            </Link>
            <span aria-hidden="true" className="text-primary-500">
              ·
            </span>
            <Link href="/dashboard" className="hover:text-accent-200">
              Studio dashboard
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
