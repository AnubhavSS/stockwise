import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { mockActivities, mockStockMovements } from "@/data/mock-activities";
import { mockProducts } from "@/data/mock-products";
import { STORAGE_KEYS } from "@/lib/constants";
import { zustandStorage } from "@/lib/storage";
import { applyStockMovement } from "@/lib/stock-transactions";
import type { Activity } from "@/types/common";
import type { Product, StockMovement } from "@/types/inventory";

type NewProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">;

type InventoryState = {
  products: Product[];
  stockMovements: StockMovement[];
  activities: Activity[];
  setProducts: (products: Product[]) => void;
  addProduct: (input: NewProductInput) => Product;
  recordMovement: (
    movement: Omit<StockMovement, "id" | "createdAt">,
  ) => void;
  addActivity: (activity: Omit<Activity, "id" | "createdAt">) => void;
  reset: () => void;
};

const initialState = {
  products: mockProducts,
  stockMovements: mockStockMovements,
  activities: mockActivities,
};

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setProducts: (products) => set({ products }),
      addProduct: (input) => {
        const now = new Date().toISOString();
        const product: Product = {
          ...input,
          id: `prod-${crypto.randomUUID()}`,
          createdAt: now,
          updatedAt: now,
        };

        set({
          products: [product, ...get().products],
          activities: [
            {
              id: `act-${crypto.randomUUID()}`,
              type: "stock_adjusted",
              title: `Item added: ${product.name}`,
              description: `${product.sku} added to catalogue`,
              referenceId: product.id,
              quantityChange: product.quantity,
              createdAt: now,
            },
            ...get().activities,
          ],
        });

        return product;
      },
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
      addActivity: (activity) => {
        set({
          activities: [
            {
              ...activity,
              id: `act-${crypto.randomUUID()}`,
              createdAt: new Date().toISOString(),
            },
            ...get().activities,
          ],
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
        activities: state.activities,
      }),
    },
  ),
);
