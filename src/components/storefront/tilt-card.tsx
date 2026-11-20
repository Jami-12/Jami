"use client";

import * as React from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";

import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

/**
 * A pointer-following 3D tilt with a soft glare highlight. Disabled on touch
 * devices and when the visitor prefers reduced motion.
 */
export function TiltCard({
  children,
  className,
  glare = true,
  maxTilt = 9,
}: {
  children: React.ReactNode;
  className?: string;
  glare?: boolean;
  maxTilt?: number;
}) {
  const reducedMotion = useReducedMotion();
  const coarsePointer = useMediaQuery("(pointer: coarse)");
  const disabled = Boolean(reducedMotion) || coarsePointer;

  const rotateX = useSpring(useMotionValue(0), {
    stiffness: 220,
    damping: 22,
  });
  const rotateY = useSpring(useMotionValue(0), {
    stiffness: 220,
    damping: 22,
  });
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const glareOpacity = useSpring(useMotionValue(0), {
    stiffness: 200,
    damping: 30,
  });
  const background = useMotionTemplate`radial-gradient(300px circle at ${glareX}% ${glareY}%, color-mix(in oklab, var(--color-primary-50) 35%, transparent), transparent 62%)`;

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * maxTilt * 2);
    rotateX.set((0.5 - py) * maxTilt * 2);
    glareX.set(px * 100);
    glareY.set(py * 100);
    glareOpacity.set(1);
  };

  const reset = () => {
    rotateX.set(0);
    rotateY.set(0);
    glareOpacity.set(0);
  };

  return (
    <div style={{ perspective: 1000 }} className={cn("h-full", className)}>
      <motion.div
        onPointerMove={onPointerMove}
        onPointerLeave={reset}
        onPointerCancel={reset}
        style={{
          rotateX: disabled ? 0 : rotateX,
          rotateY: disabled ? 0 : rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative h-full"
      >
        {children}
        {glare && !disabled ? (
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] mix-blend-overlay"
            style={{ background, opacity: glareOpacity }}
          />
        ) : null}
      </motion.div>
    </div>
  );
}
