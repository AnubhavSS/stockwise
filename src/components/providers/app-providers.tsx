"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

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
  useEffect(() => {
    void hydrateStores();
  }, []);

  return (
    <TooltipProvider delay={200}>
      {children}
      <Toaster position="top-right" />
    </TooltipProvider>
  );
}
