"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), iframe, object, embed, [contenteditable], [tabindex]:not([tabindex="-1"])';

/**
 * Traps keyboard focus inside an overlay, closes on Escape, restores focus to
 * the previously focused element on unmount, and locks body scroll while open.
 */
export function useFocusTrap<T extends HTMLElement>(
  active: boolean,
  onClose: () => void,
) {
  const containerRef = useRef<T>(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const previous = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const getFocusable = (): HTMLElement[] =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) =>
          element.offsetParent !== null ||
          element === document.activeElement ||
          element.getAttribute("aria-hidden") !== "true",
      );

    const focusFirst = () => {
      const preferred = container.querySelector<HTMLElement>("[data-autofocus]");
      const target = preferred ?? getFocusable()[0] ?? container;
      target.focus({ preventScroll: true });
    };

    const frame = window.requestAnimationFrame(focusFirst);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = getFocusable();
      if (focusable.length === 0) {
        event.preventDefault();
        container.focus({ preventScroll: true });
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      if (previous instanceof HTMLElement) {
        previous.focus({ preventScroll: true });
      }
    };
  }, [active]);

  return containerRef;
}
