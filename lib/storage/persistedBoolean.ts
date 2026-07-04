"use client";

import { useCallback, useSyncExternalStore } from "react";

/** A single persisted boolean UI preference (e.g. a "collapsed" toggle) that survives page
 *  refreshes and future visits. Mirrors the useSyncExternalStore pattern in savedListeners.ts
 *  so SSR/client hydration never mismatches: getServerSnapshot always returns `defaultValue`. */

function readBoolean(key: string, defaultValue: boolean): boolean {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? defaultValue : raw === "true";
  } catch {
    return defaultValue;
  }
}

function writeBoolean(key: string, value: boolean) {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // localStorage unavailable (e.g. private browsing quota) — preference just doesn't
    // persist for this tab session, an acceptable degradation (matches savedListeners.ts).
  }
}

const snapshotCache = new Map<string, boolean>();
const subscribers = new Map<string, Set<() => void>>();

function getSnapshot(key: string, defaultValue: boolean): boolean {
  if (!snapshotCache.has(key)) snapshotCache.set(key, readBoolean(key, defaultValue));
  return snapshotCache.get(key)!;
}

function invalidate(key: string) {
  subscribers.get(key)?.forEach((notify) => notify());
}

export function usePersistedBoolean(key: string, defaultValue: boolean) {
  const value = useSyncExternalStore(
    useCallback(
      (onStoreChange: () => void) => {
        if (!subscribers.has(key)) subscribers.set(key, new Set());
        const set = subscribers.get(key)!;
        set.add(onStoreChange);
        return () => set.delete(onStoreChange);
      },
      [key],
    ),
    () => getSnapshot(key, defaultValue),
    () => defaultValue,
  );

  const setValue = useCallback(
    (next: boolean) => {
      snapshotCache.set(key, next);
      writeBoolean(key, next);
      invalidate(key);
    },
    [key],
  );

  return [value, setValue] as const;
}
