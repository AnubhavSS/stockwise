import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { mockStockMovements } from "@/data/mock-activities";
import { mockProducts } from "@/data/mock-products";
import { STORAGE_KEYS } from "@/lib/constants";
import { zustandStorage } from "@/lib/storage";
import { applyStockMovement } from "@/lib/stock-transactions";
import type { Product, StockMovement } from "@/types/inventory";

type InventoryState = {
  products: Product[];
  stockMovements: StockMovement[];
  setProducts: (products: Product[]) => void;
  recordMovement: (
    movement: Omit<StockMovement, "id" | "createdAt">,
  ) => void;
  reset: () => void;
};

const initialState = {
  products: mockProducts,
  stockMovements: mockStockMovements,
};

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setProducts: (products) => set({ products }),
      recordMovement: (input) => {
        const result = applyStockMovement({
          products: get().products,
          movement: input,
        });

        set({
          products: result.products,
          stockMovements: [result.movement, ...get().stockMovements],
        });
      },
      reset: () => set(initialState),
    }),
    {
      name: STORAGE_KEYS.inventory,
      storage: createJSONStorage(() => zustandStorage),
      skipHydration: true,
      partialize: (state) => ({
        products: state.products,
        stockMovements: state.stockMovements,
      }),
    },
  ),
);
