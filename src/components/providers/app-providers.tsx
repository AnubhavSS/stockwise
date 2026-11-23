"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

import { TooltipProvider } from "@/components/ui/tooltip";
import { useInventoryStore } from "@/store/inventory-store";
import { usePurchaseStore } from "@/store/purchase-store";
import { useSalesStore } from "@/store/sales-store";
import { useUiStore } from "@/store/ui-store";

function hydrateStores() {
  void useInventoryStore.persist.rehydrate();
  void useSalesStore.persist.rehydrate();
  void usePurchaseStore.persist.rehydrate();
  void useUiStore.persist.rehydrate();
}

export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    hydrateStores();
  }, []);

  return <TooltipProvider delay={200}>{children}</TooltipProvider>;
}
