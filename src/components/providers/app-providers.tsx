"use client";

/**
 * Client providers. Rehydrates Zustand stores from localStorage after mount.
 * Route children always stay mounted (required for Next.js instant navigation);
 * a full-screen loader covers the UI until rehydration finishes.
 */

import { useEffect } from "react";
import type { ReactNode } from "react";

import { PageLoader } from "@/components/shared/page-loader";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useInventoryStore } from "@/store/inventory-store";
import { usePurchaseStore } from "@/store/purchase-store";
import { useSalesStore } from "@/store/sales-store";
import { useUiStore } from "@/store/ui-store";

async function hydrateStores() {
  await Promise.all([
    useInventoryStore.persist.rehydrate(),
    useSalesStore.persist.rehydrate(),
    usePurchaseStore.persist.rehydrate(),
    useUiStore.persist.rehydrate(),
  ]);
  useUiStore.setState({ hasHydrated: true });
}

export function AppProviders({ children }: { children: ReactNode }) {
  const hasHydrated = useUiStore((state) => state.hasHydrated);

  useEffect(() => {
    void hydrateStores();
  }, []);

  return (
    <TooltipProvider delay={200}>
      {/* Always render route segments so Next.js can validate instant navigation. */}
      {children}
      {!hasHydrated ? (
        <PageLoader fullScreen label="Loading your workspace…" />
      ) : null}
      <Toaster position="top-right" />
    </TooltipProvider>
  );
}
