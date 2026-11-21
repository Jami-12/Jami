import {
  RefreshCcw,
  Rotate3d,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from "lucide-react";

import { TRUST_POINTS } from "@/data/visuals";

const ICONS: Record<string, LucideIcon> = {
  rotate: Rotate3d,
  truck: Truck,
  refresh: RefreshCcw,
  shield: ShieldCheck,
};

export function TrustStrip() {
  return (
    <section aria-label="Service promises" className="border-y border-border bg-background">
      <div className="container-page grid gap-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
        {TRUST_POINTS.map((point) => {
          const Icon = ICONS[point.icon] ?? ShieldCheck;
          return (
            <div key={point.title} className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-none border border-border bg-secondary text-foreground">
                <Icon className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-[0.12em]">{point.title}</h2>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {point.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
