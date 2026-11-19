import { AtSign, Mail, MapPin, Phone, Play, Send } from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { SITE } from "@/lib/constants";

const SOCIAL_LINKS = [
  { href: SITE.social.instagram, label: "Instagram", Icon: AtSign },
  { href: SITE.social.x, label: "X", Icon: Send },
  { href: SITE.social.youtube, label: "YouTube", Icon: Play },
] as const;

export function FooterBrand() {
  return (
    <div>
      <Brand />
      <p className="mt-6 max-w-sm font-display text-2xl font-semibold leading-snug tracking-tight text-foreground">
        Modern wardrobe,
        <span className="block text-primary-600 dark:text-accent-300">
          considered.
        </span>
      </p>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
        An editorial house for elevated essentials, quiet tailoring and pieces
        made to be worn for years, not seasons.
      </p>

      <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
        <li>
          <a
            href={`mailto:${SITE.email}`}
            className="inline-flex items-center gap-2.5 transition hover:text-foreground"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card">
              <Mail className="h-4 w-4" aria-hidden="true" />
            </span>
            {SITE.email}
          </a>
        </li>
        <li>
          <a
            href={`tel:${SITE.phone.replace(/\s+/g, "")}`}
            className="inline-flex items-center gap-2.5 transition hover:text-foreground"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card">
              <Phone className="h-4 w-4" aria-hidden="true" />
            </span>
            {SITE.phone}
          </a>
        </li>
        <li className="inline-flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card">
            <MapPin className="h-4 w-4" aria-hidden="true" />
          </span>
          {SITE.address}
        </li>
      </ul>

      <div className="mt-6 flex items-center gap-2">
        {SOCIAL_LINKS.map(({ href, label, Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={`${SITE.name} on ${label}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:border-accent-400/50 hover:text-foreground"
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </a>
        ))}
      </div>
    </div>
  );
}
