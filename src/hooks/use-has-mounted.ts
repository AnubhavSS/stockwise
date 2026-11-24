/**
 * True only after the component has mounted in the browser.
 * Use this to wait before reading localStorage-backed stores so SSR HTML
 * and the first client render stay in sync.
 */
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => undefined;

export function useHasMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
