import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { mockPurchases } from "@/data/mock-purchases";
import { mockSuppliers } from "@/data/mock-suppliers";
import { STORAGE_KEYS } from "@/lib/constants";
import { zustandStorage } from "@/lib/storage";
import type { Purchase } from "@/types/purchase";
import type { Supplier } from "@/types/supplier";

type PurchaseState = {
  purchases: Purchase[];
  suppliers: Supplier[];
  setPurchases: (purchases: Purchase[]) => void;
  setSuppliers: (suppliers: Supplier[]) => void;
  reset: () => void;
};

const initialState = {
  purchases: mockPurchases,
  suppliers: mockSuppliers,
};

export const usePurchaseStore = create<PurchaseState>()(
  persist(
    (set) => ({
      ...initialState,
      setPurchases: (purchases) => set({ purchases }),
      setSuppliers: (suppliers) => set({ suppliers }),
      reset: () => set(initialState),
    }),
    {
      name: STORAGE_KEYS.purchases,
      storage: createJSONStorage(() => zustandStorage),
      skipHydration: true,
      partialize: (state) => ({
        purchases: state.purchases,
        suppliers: state.suppliers,
      }),
    },
  ),
);
