import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-primary-950 text-primary-50 lg:flex lg:flex-col lg:justify-between lg:p-10">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(60% 50% at 20% 10%, rgba(125,211,252,0.22), transparent 70%), radial-gradient(50% 45% at 90% 85%, rgba(31,162,224,0.24), transparent 70%)",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative">
          <Brand href="/" />
        </div>
        <div className="relative max-w-md">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-accent-200 backdrop-blur">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            The considered edit
          </p>
          <blockquote className="mt-5 text-3xl font-extrabold leading-tight tracking-tight">
            Objects chosen for how they feel, sound and age — not how loudly they
            announce themselves.
          </blockquote>
          <p className="mt-4 text-sm leading-relaxed text-primary-200">
            Your account keeps orders, saved objects, delivery addresses and
            payment history in one calm place.
          </p>
        </div>
        <div className="relative flex items-center gap-4 text-[11px] text-primary-300">
          <span>Carbon-neutral delivery</span>
          <span aria-hidden="true">·</span>
          <span>30-day returns</span>
          <span aria-hidden="true">·</span>
          <span>Secure payments</span>
        </div>
      </aside>

      <div className="flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Storefront
            </Link>
            <span className="lg:hidden">
              <Brand href="/" showWordmark={false} />
            </span>
          </div>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center px-4 pb-12 pt-4 sm:px-8">
          <div className="w-full max-w-md">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary-500 dark:text-accent-300">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
            <div className="mt-7">{children}</div>
            {footer ? <div className="mt-6">{footer}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
