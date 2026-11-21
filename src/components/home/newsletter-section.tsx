import { Mail } from "lucide-react";

import { NewsletterForm } from "@/components/storefront/newsletter-form";

export function NewsletterSection() {
  return (
    <section
      id="newsletter"
      aria-labelledby="newsletter-heading"
      className="container-page scroll-mt-24 py-14 sm:py-20"
    >
      <div className="surface-card px-6 py-12 sm:px-10 sm:py-14">
        <div className="grid gap-8 border-t border-border pt-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12">
          <div>
            <p className="eyebrow text-muted-foreground">The Sunday note</p>
            <h2
              id="newsletter-heading"
              className="mt-4 max-w-xl font-display text-3xl font-semibold leading-tight not-italic tracking-[-0.02em] sm:text-4xl"
            >
              First look at every drop, plus notes from the studio.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
              One considered email every other Sunday. New pieces, restocks and
              the occasional essay on buying less and wearing it longer.
            </p>
          </div>

          <div className="border border-border bg-background p-5">
            <div className="mb-4 flex items-center gap-2 border-b border-border pb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-foreground">
              <Mail className="h-4 w-4" aria-hidden="true" />
              Join the list
            </div>
            <NewsletterForm />
            <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
              No noise, no daily sales. Unsubscribe whenever you like.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
