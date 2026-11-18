import type { MetadataRoute } from "next";

import { SITE } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aether — Objects for a considered life",
    short_name: "Aether",
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#F8F6F0",
    theme_color: "#172B3A",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
