import type { MetadataRoute } from "next";

import { SITE } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aether — Objects for a considered life",
    short_name: "Aether",
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f6f8fc",
    theme_color: "#2c4561",
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
