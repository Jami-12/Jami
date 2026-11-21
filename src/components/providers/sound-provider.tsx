"use client";

import { useEffect } from "react";

import { playClickSound } from "@/lib/click-sound";
import { useSoundStore } from "@/stores/sound-store";

/**
 * Delegated pointer feedback for buttons and switches. Components can opt out
 * with `data-sound-off` (for example a silent icon control).
 */
export function SoundProvider() {
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!useSoundStore.getState().enabled) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const control = target.closest<HTMLElement>(
 "button, [role='switch'], [data-sound]",
      );
      if (!control) return;
      if (control.hasAttribute("data-sound-off")) return;
      if (
        control instanceof HTMLButtonElement &&
        (control.disabled || control.getAttribute("aria-disabled") === "true")
      ) {
        return;
      }

      playClickSound(control.getAttribute("role") === "switch" ? "toggle" : "click");
    };

    document.addEventListener("pointerdown", handlePointerDown, {
      capture: true,
      passive: true,
    });
    return () => document.removeEventListener("pointerdown", handlePointerDown, true);
  }, []);

  return null;
}
