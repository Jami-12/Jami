"use client";

import { useEffect, useState } from "react";

/** True only after the client has hydrated, used to gate persisted UI state. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}
