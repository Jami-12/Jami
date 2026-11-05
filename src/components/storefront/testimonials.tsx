import { Quote } from "lucide-react";

import { TESTIMONIALS } from "@/data/visuals";

export function Testimonials() {
  return (
    <section aria-labelledby="testimonials-heading" className="container-page py-14 sm:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary-500 dark:text-accent-300">
          From the people who live with them
        </p>
        <h2 id="testimonials-heading" className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
          Quietly recommended.
        </h2>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {TESTIMONIALS.map((testimonial) => (
          <figure
            key={testimonial.name}
            className="relative flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-soft"
          >
            <Quote className="h-6 w-6 text-accent-400" aria-hidden="true" />
            <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
              &ldquo;{testimonial.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-5 border-t border-border pt-4">
              <p className="text-sm font-bold">{testimonial.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {testimonial.role}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
