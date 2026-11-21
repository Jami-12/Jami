"use client";

import { Volume2, VolumeX } from "lucide-react";

import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";
import { useSoundStore } from "@/stores/sound-store";

export function SoundToggle({ className }: { className?: string }) {
  const enabled = useSoundStore((state) => state.enabled);
  const toggle = useSoundStore((state) => state.toggle);
  const hydrated = useHydrated();
  const audible = hydrated ? enabled : true;

  return (
    <button
      type="button"
      data-sound-off
      onClick={toggle}
      aria-label={audible ? "Mute interface sounds" : "Enable interface sounds"}
      aria-pressed={audible}
      title={audible ? "Mute sounds" : "Enable sounds"}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-none border border-border bg-background text-muted-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {audible ? (
        <Volume2 className="h-4 w-4" aria-hidden="true" />
      ) : (
        <VolumeX className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
