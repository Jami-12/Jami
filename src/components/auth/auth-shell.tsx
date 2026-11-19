import Link from "next/link";
import { ArrowLeft, ShieldCheck, Sparkles, Truck } from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Card } from "@/components/ui/card";
import { SmartImage } from "@/components/ui/smart-image";

const HIGHLIGHTS = [
  { icon: Truck, label: "Carbon-neutral delivery" },
  { icon: ShieldCheck, label: "Secure payments" },
  { icon: Sparkles, label: "30-day considered returns" },
] as const;

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
    <div className="grid min-h-dvh bg-background lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <aside className="relative hidden overflow-hidden bg-primary-950 text-primary-50 lg:flex lg:min-h-dvh lg:flex-col lg:justify-between lg:p-10 xl:p-14">
        <SmartImage
          src="/showcase/editorial-rust.webp"
          alt="A considered wardrobe edit photographed in warm light"
          fill
          priority
          sizes="(min-width: 1024px) 52vw, 100vw"
          className="object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-primary-950/75 via-primary-950/45 to-primary-950/90"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(70%_55%_at_12%_10%,rgba(198,164,106,0.28),transparent_70%)]"
        />

        <div className="relative flex items-start justify-between gap-6">
          <Brand href="/" tone="inverse" />
          <p className="hidden max-w-[12rem] text-right text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60 xl:block">
            A calmer way to shop and keep track
          </p>
        </div>

        <div className="relative max-w-md">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-accent-200 backdrop-blur">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            The considered edit
          </p>
          <blockquote className="mt-6 font-display text-3xl leading-[1.12] tracking-tight text-white xl:text-[2.6rem]">
            Pieces chosen for how they feel, move and age — not how loudly they
            announce themselves.
          </blockquote>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/75">
            Your account keeps orders, saved pieces, delivery addresses and
            payment history in one calm, secure place.
          </p>

          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 backdrop-blur-sm"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent-400/20 text-accent-200">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="text-sm font-medium text-white/90">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-[11px] uppercase tracking-[0.18em] text-white/50">
          Considered living · made modern
        </p>
      </aside>

      <div className="flex min-h-dvh flex-col">
        <header className="flex items-center justify-between gap-3 px-4 py-4 sm:px-8 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-accent-400/50 hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Storefront
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-[11px] font-medium text-muted-foreground sm:inline">
              Theme
            </span>
            <ThemeToggle />
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center px-4 pb-10 pt-2 sm:px-8 lg:px-10 lg:pb-14">
          <div className="w-full max-w-md">
            <div className="mb-6 lg:hidden">
              <Brand href="/" />
            </div>

            <Card className="overflow-hidden border-border/80 bg-card/95 p-6 shadow-soft backdrop-blur-sm sm:p-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary-600 dark:text-accent-300">
                {eyebrow}
              </p>
              <h1 className="mt-3 font-display text-3xl leading-tight tracking-tight text-foreground sm:text-[2.2rem]">
                {title}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
              <div className="mt-8">{children}</div>
              {footer ? (
                <div className="mt-6 border-t border-border pt-6">{footer}</div>
              ) : null}
            </Card>

            <p className="mt-5 text-center text-[11px] leading-relaxed text-muted-foreground">
              Protected by secure authentication. By continuing you agree to our
              care and privacy standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
