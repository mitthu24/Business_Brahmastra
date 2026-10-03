"use client";

import { useEffect, useState } from "react";

/** A simple localStorage-backed state hook for client-only persistence of form-like data. */
export function useLocalStorageState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // One-time hydration from an external source (localStorage) on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: synchronizing from an external store that isn't readable during SSR.
    setState(() => {
      try {
        const raw = window.localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : initialValue;
      } catch {
        return initialValue;
      }
    });
    setHydrated(true);
    // Intentionally run only once on mount per key; initialValue is a stable default, not a reactive dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore write failures (e.g. private browsing quota)
    }
  }, [key, state, hydrated]);

  return [state, setState] as const;
}
