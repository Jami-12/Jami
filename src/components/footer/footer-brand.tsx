import { AtSign, Mail, MapPin, Phone, Play, Send } from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { SITE } from "@/lib/constants";

export function FooterBrand() {
  return (
    <div>
      <Brand />
      <p className="mt-5 max-w-sm font-display text-xl font-semibold leading-snug tracking-[-0.01em]">
        Modern wardrobe,
        <span className="block italic text-primary-600 dark:text-accent-300">
          considered.
        </span>
      </p>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
        An editorial fashion house for elevated essentials, quiet tailoring and
        pieces made to be worn for years, not seasons.
      </p>

      <ul className="mt-6 space-y-2.5 text-sm text-muted-foreground">
        <li>
          <a
            href={`mailto:${SITE.email}`}
            className="inline-flex items-center gap-2 transition hover:text-foreground"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            {SITE.email}
          </a>
        </li>
        <li>
          <a
            href={`tel:${SITE.phone.replace(/\s+/g, "")}`}
            className="inline-flex items-center gap-2 transition hover:text-foreground"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            {SITE.phone}
          </a>
        </li>
        <li className="inline-flex items-center gap-2">
          <MapPin className="h-4 w-4" aria-hidden="true" />
          {SITE.address}
        </li>
      </ul>

      <div className="mt-6 flex items-center gap-2">
        {[
          { href: SITE.social.instagram, label: "Aether on Instagram", Icon: AtSign },
          { href: SITE.social.x, label: "Aether on X", Icon: Send },
          { href: SITE.social.youtube, label: "Aether on YouTube", Icon: Play },
        ].map(({ href, label, Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-primary-300 hover:text-foreground"
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </a>
        ))}
      </div>
    </div>
  );
}
