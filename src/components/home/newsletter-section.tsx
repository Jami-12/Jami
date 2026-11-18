import { Mail, Sparkles } from "lucide-react";

import { NewsletterForm } from "@/components/storefront/newsletter-form";

export function NewsletterSection() {
  return (
    <section
      id="newsletter"
      aria-labelledby="newsletter-heading"
      className="container-page scroll-mt-24 py-14 sm:py-20"
    >
      <div className="relative overflow-hidden rounded-3xl border border-border bg-[#E9ECE4] px-6 py-12 text-[#1E2E38] shadow-soft sm:px-10 sm:py-14 dark:bg-[#16242E] dark:text-[#F3F2EC]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(198,164,106,0.45),transparent_70%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(36,75,80,0.18),transparent_70%)] dark:bg-[radial-gradient(circle,rgba(198,164,106,0.14),transparent_70%)]"
        />
        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="eyebrow inline-flex items-center gap-2 text-[#244B50] dark:text-accent-300">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              The Sunday note
            </p>
            <h2
              id="newsletter-heading"
              className="mt-3 max-w-xl font-display text-3xl font-semibold leading-tight tracking-[-0.02em] sm:text-4xl"
            >
              First look at every drop, plus notes from the studio.
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#4B5654] dark:text-[#A7B4B2]">
              One considered email every other Sunday. New pieces, restocks and
              the occasional essay on buying less and wearing it longer.
            </p>
          </div>

          <div className="rounded-2xl border border-[#DCE1DA] bg-white/55 p-5 backdrop-blur-sm dark:border-[#2A383F] dark:bg-[#1E2E38]/70">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold">
              <Mail className="h-4 w-4 text-[#244B50] dark:text-accent-300" aria-hidden="true" />
              Join the list
            </div>
            <NewsletterForm />
            <p className="mt-3 text-[10px] leading-relaxed text-[#6F7C79] dark:text-[#A7B4B2]">
              No noise, no daily sales. Unsubscribe whenever you like.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
