"use client";

/**
 * React binding for a single localStorage key. Listens to native `storage`
 * events (other tabs) and a custom event (same tab) so UI stays in sync.
 */

import { useCallback, useRef, useSyncExternalStore } from "react";

import { writeLocalStorage } from "@/lib/storage";

const STORAGE_EVENT = "stockwise-storage";

function subscribeToStorage(onStoreChange: () => void) {
  const onWindowStorage = (event: StorageEvent) => {
    if (event.key === null || event.storageArea === window.localStorage) {
      onStoreChange();
    }
  };

  window.addEventListener("storage", onWindowStorage);
  window.addEventListener(STORAGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onWindowStorage);
    window.removeEventListener(STORAGE_EVENT, onStoreChange);
  };
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const cache = useRef<{ raw: string | null; value: T }>({
    raw: null,
    value: initialValue,
  });

  const getSnapshot = () => {
    const raw = window.localStorage.getItem(key);
    if (raw === cache.current.raw) {
      return cache.current.value;
    }

    let value = initialValue;
    if (raw) {
      try {
        value = JSON.parse(raw) as T;
      } catch {
        value = initialValue;
      }
    }

    cache.current = { raw, value };
    return value;
  };

  const value = useSyncExternalStore(
    subscribeToStorage,
    getSnapshot,
    () => initialValue,
  );

  const setValue = useCallback(
    (next: T | ((current: T) => T)) => {
      const current = (() => {
        try {
          const raw = window.localStorage.getItem(key);
          return raw ? (JSON.parse(raw) as T) : initialValue;
        } catch {
          return initialValue;
        }
      })();
      const resolved = next instanceof Function ? next(current) : next;
      writeLocalStorage(key, resolved);
      window.dispatchEvent(new Event(STORAGE_EVENT));
    },
    [initialValue, key],
  );

  return { value, setValue, hydrated: true } as const;
}
