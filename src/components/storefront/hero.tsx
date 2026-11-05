import Link from "next/link";
import { ArrowRight, Box, ShieldCheck, Sparkles } from "lucide-react";

import { HeroCanvas } from "@/components/three/hero-canvas";
import { Button } from "@/components/ui/button";

const STATS = [
  { value: "3D", label: "inspect every object" },
  { value: "2 yr", label: "materials warranty" },
  { value: "30 d", label: "considered returns" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hero-grid-bg"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-accent-300/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-primary-400/15 blur-3xl"
      />

      <div className="container-page relative grid gap-10 py-12 lg:grid-cols-[1.08fr_1fr] lg:items-center lg:gap-8 lg:py-20">
        <div className="animate-fade-up">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-primary-600 shadow-soft backdrop-blur dark:text-accent-200">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            The 2026 considered collection
          </p>

          <h1 className="mt-5 text-4xl font-extrabold leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl">
            Objects for a{" "}
            <span className="gradient-text">considered</span> life.
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Audio, lighting, workspace and everyday objects — chosen for how
            they feel, how they age, and how they fit into a quieter kind of
            living. Explore each piece in real-time 3D before it ships.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/products">
                Shop the collection
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/#showroom">
                <Box className="h-4 w-4" aria-hidden="true" />
                Enter the 3D showroom
              </Link>
            </Button>
          </div>

          <dl className="mt-9 grid max-w-md grid-cols-3 gap-3">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-card/70 px-3 py-2.5 backdrop-blur"
              >
                <dt className="text-lg font-extrabold tracking-tight">
                  {stat.value}
                </dt>
                <dd className="mt-0.5 text-[10px] leading-snug text-muted-foreground">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-6 inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
            Secure checkout · bKash, Nagad, card & cash on delivery
          </p>
        </div>

        <div className="relative mx-auto h-[22rem] w-full max-w-xl sm:h-[28rem] lg:h-[34rem]">
          <div
            aria-hidden="true"
            className="absolute inset-6 rounded-[2.5rem] border border-white/40 bg-gradient-to-br from-white/40 to-transparent shadow-soft backdrop-blur-sm dark:border-white/10 dark:from-white/5"
          />
          <div className="absolute inset-0">
            <HeroCanvas />
          </div>
          <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground backdrop-blur">
            Drag to rotate · Live 3D
          </div>
        </div>
      </div>
    </section>
  );
}
