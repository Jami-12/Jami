import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SmartImage } from "@/components/ui/smart-image";

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
      <aside className="relative hidden overflow-hidden bg-primary-950 text-primary-50 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <SmartImage
          src="/showcase/editorial-rust.webp"
          alt="A considered wardrobe edit photographed in warm light"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-primary-950/80 via-primary-950/45 to-primary-950/90"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(70%_55%_at_15%_8%,rgba(198,164,106,0.28),transparent_70%)]"
        />

        <div className="relative">
          <Brand href="/" />
        </div>

        <div className="relative max-w-md">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-accent-200 backdrop-blur">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            The considered edit
          </p>
          <blockquote className="mt-6 font-display text-3xl leading-[1.15] tracking-tight text-primary-50 xl:text-4xl">
            Pieces chosen for how they feel, move and age — not how loudly they
            announce themselves.
          </blockquote>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-primary-200/90">
            Your account keeps orders, saved pieces, delivery addresses and
            payment history in one calm place.
          </p>
        </div>

        <div className="relative flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] uppercase tracking-[0.16em] text-primary-300">
          <span>Carbon-neutral delivery</span>
          <span aria-hidden="true" className="text-accent-400">·</span>
          <span>30-day returns</span>
          <span aria-hidden="true" className="text-accent-400">·</span>
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

        <div className="flex flex-1 items-center justify-center px-4 pb-14 pt-2 sm:px-8">
          <div className="w-full max-w-md animate-fade-up">
            <p className="eyebrow text-[var(--color-primary-600)] dark:text-[var(--color-accent-300)]">
              {eyebrow}
            </p>
            <h1 className="mt-3 font-display text-3xl leading-tight tracking-tight sm:text-[2.35rem]">
              {title}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
            <div className="mt-8">{children}</div>
            {footer ? <div className="mt-6">{footer}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
