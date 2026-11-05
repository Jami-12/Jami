import { ArrowUpRight, BookOpen } from "lucide-react";

import { SmartImage } from "@/components/ui/smart-image";
import { JOURNAL_POSTS } from "@/data/visuals";

export function JournalSection() {
  return (
    <section id="journal" aria-labelledby="journal-heading" className="container-page scroll-mt-24 py-14 sm:py-16">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-primary-500 dark:text-accent-300">
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            The journal
          </p>
          <h2 id="journal-heading" className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Notes on making and living well.
          </h2>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Studio visits, material studies and the small decisions that make an
          object worth keeping.
        </p>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-3">
        {JOURNAL_POSTS.map((post) => (
          <article
            key={post.title}
            className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-shadow hover:shadow-lift"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
              <SmartImage
                src={post.image}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary-800 backdrop-blur">
                {post.category}
              </span>
            </div>
            <div className="p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {post.readTime}
              </p>
              <h3 className="mt-2 text-base font-bold leading-snug tracking-tight">
                {post.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {post.excerpt}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-accent-300">
                Read the note
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
