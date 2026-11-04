import Link from "next/link";
import { ArrowUpRight, AtSign, Play, Send } from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { Badge } from "@/components/ui/badge";
import { NewsletterForm } from "@/components/storefront/newsletter-form";
import { FOOTER_NAV, SITE } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-card/60">
      <div className="container-page py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_2fr] lg:gap-16">
          <div>
            <Brand />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Aether is a design-led commerce house for audio, wearables,
              lighting and workspace objects. Engineered in 3D, built to last.
            </p>
            <div className="mt-6 max-w-sm">
              <NewsletterForm />
            </div>
            <div className="mt-6 flex items-center gap-2">
              <a
                href={SITE.social.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Aether on Instagram"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:border-primary-300 hover:text-foreground"
              >
                <AtSign className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href={SITE.social.x}
                target="_blank"
                rel="noreferrer"
                aria-label="Aether on X"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:border-primary-300 hover:text-foreground"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href={SITE.social.youtube}
                target="_blank"
                rel="noreferrer"
                aria-label="Aether on YouTube"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:border-primary-300 hover:text-foreground"
              >
                <Play className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {FOOTER_NAV.map((group) => (
              <div key={group.title}>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  {group.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Secure checkout</span>
            {["Stripe", "Visa", "bKash", "Nagad", "COD"].map((method) => (
              <Badge key={method} tone="outline" className="normal-case tracking-normal">
                {method}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} Aether Commerce</span>
            <Link href="/#privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/#terms" className="hover:text-foreground">
              Terms
            </Link>
            <a
              href={`mailto:${SITE.email}`}
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              {SITE.email}
              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
