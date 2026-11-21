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
      <div className="relative h-56 w-56 border border-border">
        <div className="absolute inset-8 border border-border" />
        <div className="absolute inset-16 border border-foreground/30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Box className="h-7 w-7 animate-pulse text-muted-foreground" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

function WebGlFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="relative flex h-64 w-64 items-center justify-center border border-border">
        <div className="absolute inset-4 border border-border" />
        <div className="absolute inset-10 border border-foreground/30" />
        <div className="absolute inset-16 border border-border" />
        <div className="relative h-24 w-24 border border-foreground bg-foreground">
          <div className="absolute inset-2 border border-background/30" />
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
