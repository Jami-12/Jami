"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Box } from "lucide-react";

const HeroScene = dynamic(() => import("./hero-scene"), {
  ssr: false,
  loading: () => <SceneSkeleton />,
});

function SceneSkeleton() {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      aria-busy="true"
      aria-label="Loading 3D scene"
    >
      <div className="relative h-56 w-56">
        <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-primary-500/30 via-accent-300/20 to-transparent blur-xl" />
        <div className="absolute inset-8 animate-pulse rounded-full border border-accent-400/30" />
        <div className="absolute inset-16 animate-pulse rounded-full border border-primary-400/30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Box className="h-7 w-7 animate-pulse text-primary-300" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

function WebGlFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="relative flex h-64 w-64 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(125,211,252,0.4),transparent_60%)]" />
        <div className="absolute inset-4 rounded-full border border-accent-400/40" />
        <div className="absolute inset-10 rounded-full border border-primary-400/40" />
        <div className="absolute inset-16 rounded-full border border-accent-300/50" />
        <div className="relative h-24 w-24 rotate-12 rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 shadow-lift">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-transparent via-accent-300/20 to-accent-300/50" />
        </div>
        <span className="absolute bottom-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          3D preview unavailable
        </span>
      </div>
    </div>
  );
}

export function HeroCanvas() {
  const [supported, setSupported] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const context =
        canvas.getContext("webgl2") ?? canvas.getContext("webgl");
      setSupported(Boolean(context));
    } catch {
      setSupported(false);
    }
  }, []);

  if (supported === null) return <SceneSkeleton />;
  if (!supported) return <WebGlFallback />;
  return <HeroScene />;
}
