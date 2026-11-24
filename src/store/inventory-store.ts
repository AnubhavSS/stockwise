/**
 * Catalogue, stock movements, and the activity feed.
 * Persisted to localStorage (`skipHydration` so SSR does not fight the client).
 *
 * Opening quantity is stored as an adjustment movement, not as a silent
 * quantity write. Products with movement history are archived instead of
 * deleted so reports keep a complete trail.
 */
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { mockActivities, mockStockMovements } from "@/data/mock-activities";
import { mockProducts } from "@/data/mock-products";
import { STORAGE_KEYS } from "@/lib/constants";
import { zustandStorage } from "@/lib/storage";
import {
  applyStockMovement,
  applyStockMovementBatch,
  computeAdjustment,
  type StockTransactionInput,
  type StockTransactionResult,
} from "@/lib/stock-transactions";
import type { Activity } from "@/types/common";
import type {
  NewProductInput,
  Product,
  ProductDraft,
  StockAdjustmentType,
  StockMovement,
} from "@/types/inventory";

type InventoryState = {
  products: Product[];
  stockMovements: StockMovement[];
  activities: Activity[];
  setProducts: (products: Product[]) => void;
  addProduct: (input: NewProductInput) => Product | { error: string };
  updateProduct: (id: string, patch: ProductDraft) => Product | { error: string };
  archiveProduct: (id: string) => Product | { error: string };
  deleteProduct: (id: string) => { ok: true } | { error: string };
  adjustStock: (input: {
    productId: string;
    type: StockAdjustmentType;
    quantity: number;
    remarks: string;
  }) => StockTransactionResult;
  recordMovement: (
    movement: Omit<StockMovement, "id" | "createdAt">,
  ) => StockTransactionResult;
  recordMovements: (
    movements: StockTransactionInput[],
    activity?: Omit<Activity, "id" | "createdAt">,
  ) =>
    | { ok: true; products: Product[]; movements: StockMovement[] }
    | { ok: false; error: string };
  addActivity: (activity: Omit<Activity, "id" | "createdAt">) => void;
  reset: () => void;
};

const initialState = {
  products: mockProducts,
  stockMovements: mockStockMovements,
  activities: mockActivities,
};

function prependActivity(
  activities: Activity[],
  activity: Omit<Activity, "id" | "createdAt">,
  createdAt = new Date().toISOString(),
): Activity[] {
  return [
    {
      ...activity,
      id: `act-${crypto.randomUUID()}`,
      createdAt,
    },
    ...activities,
  ];
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setProducts: (products) => set({ products }),
      addProduct: (input) => {
        const now = new Date().toISOString();
        const duplicate = get().products.some(
          (product) => product.sku.toLowerCase() === input.sku.trim().toLowerCase(),
        );

        if (duplicate) {
          return { error: "A product with this SKU already exists." };
        }

        const product: Product = {
          id: `prod-${crypto.randomUUID()}`,
          name: input.name.trim(),
          sku: input.sku.trim().toUpperCase(),
          category: input.category,
          description: input.description.trim(),
          quantity: 0,
          minimumStockLevel: input.minimumStockLevel,
          unitPrice: input.unitPrice,
          costPrice: input.costPrice,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        };

        let products = [product, ...get().products];
        let stockMovements = get().stockMovements;
        const activities = prependActivity(
          get().activities,
          {
            type: "stock_adjusted",
            title: `Item added: ${product.name}`,
            description: `${product.sku} added to catalogue`,
            referenceId: product.id,
            quantityChange: input.quantity,
          },
          now,
        );

        // Opening stock goes through the ledger so history stays accurate.
        if (input.quantity > 0) {
          const result = applyStockMovement({
            products,
            movement: {
              productId: product.id,
              type: "adjustment",
              quantityChange: input.quantity,
              referenceId: `adj-${crypto.randomUUID().slice(0, 8)}`,
              remarks: "Opening balance",
              createdAt: now,
            },
          });

          if (!result.ok) {
            return { error: result.error };
          }

          products = result.products;
          stockMovements = [result.movement, ...stockMovements];
        }

        set({ products, stockMovements, activities });
        return products.find((item) => item.id === product.id) ?? product;
      },
      updateProduct: (id, patch) => {
        const current = get().products.find((product) => product.id === id);
        if (!current) {
          return { error: "Product was not found." };
        }

        const skuClash = get().products.some(
          (product) =>
            product.id !== id &&
            product.sku.toLowerCase() === patch.sku.trim().toLowerCase(),
        );
        if (skuClash) {
          return { error: "A product with this SKU already exists." };
        }

        const now = new Date().toISOString();
        const updated: Product = {
          ...current,
          name: patch.name.trim(),
          sku: patch.sku.trim().toUpperCase(),
          category: patch.category,
          description: patch.description.trim(),
          unitPrice: patch.unitPrice,
          costPrice: patch.costPrice,
          minimumStockLevel: patch.minimumStockLevel,
          updatedAt: now,
        };

        set({
          products: get().products.map((product) =>
            product.id === id ? updated : product,
          ),
        });

        return updated;
      },
      archiveProduct: (id) => {
        const current = get().products.find((product) => product.id === id);
        if (!current) {
          return { error: "Product was not found." };
        }

        const now = new Date().toISOString();
        const archived: Product = {
          ...current,
          isActive: false,
          updatedAt: now,
        };

        set({
          products: get().products.map((product) =>
            product.id === id ? archived : product,
          ),
          activities: prependActivity(get().activities, {
            type: "stock_adjusted",
            title: `Item archived: ${current.name}`,
            description: `${current.sku} was archived to preserve history`,
            referenceId: current.id,
          }),
        });

        return archived;
      },
      deleteProduct: (id) => {
        const current = get().products.find((product) => product.id === id);
        if (!current) {
          return { error: "Product was not found." };
        }

        // Keep products that already appear on the ledger; hide them instead of deleting.
        const hasHistory = get().stockMovements.some(
          (movement) => movement.productId === id,
        );
        if (hasHistory) {
          const archived = get().archiveProduct(id);
          if ("error" in archived) {
            return archived;
          }
          return { ok: true };
        }

        set({
          products: get().products.filter((product) => product.id !== id),
          activities: prependActivity(get().activities, {
            type: "stock_adjusted",
            title: `Item deleted: ${current.name}`,
            description: `${current.sku} was removed from the catalogue`,
            referenceId: current.id,
          }),
        });

        return { ok: true };
      },
      adjustStock: (input) => {
        const product = get().products.find((item) => item.id === input.productId);
        if (!product) {
          return { ok: false, error: "Product was not found." };
        }

        const computed = computeAdjustment(
          product.quantity,
          input.type,
          input.quantity,
        );
        if (!computed.ok) {
          return computed;
        }

        if (computed.quantityChange === 0) {
          return { ok: false, error: "New quantity is the same as the current stock." };
        }

        return get().recordMovement({
          productId: product.id,
          type: "adjustment",
          quantityChange: computed.quantityChange,
          referenceId: `adj-${crypto.randomUUID().slice(0, 8)}`,
          remarks: input.remarks.trim() || "Manual stock adjustment",
        });
      },
      recordMovement: (input) => {
        const result = applyStockMovement({
          products: get().products,
          movement: input,
        });

        if (!result.ok) {
          return result;
        }

        const product = result.products.find((item) => item.id === input.productId);
        const titlePrefix =
          input.type === "sale"
            ? "Sale issued"
            : input.type === "purchase"
              ? "Purchase received"
              : "Stock updated";

        set({
          products: result.products,
          stockMovements: [result.movement, ...get().stockMovements],
          activities: prependActivity(get().activities, {
            type: "stock_adjusted",
            title: `${titlePrefix}: ${product?.name ?? "Item"}`,
            description: input.remarks,
            referenceId: result.movement.referenceId,
            quantityChange: input.quantityChange,
          }),
        });

        return result;
      },
      recordMovements: (movements, activity) => {
        const result = applyStockMovementBatch({
          products: get().products,
          movements,
        });

        if (!result.ok) {
          return result;
        }

        set({
          products: result.products,
          stockMovements: [...result.movements].reverse().concat(get().stockMovements),
          activities: activity
            ? prependActivity(get().activities, activity)
            : get().activities,
        });

        return result;
      },
      addActivity: (activity) => {
        set({
          activities: prependActivity(get().activities, activity),
        });
      },
      reset: () => set(initialState),
    }),
    {
      name: STORAGE_KEYS.inventory,
      storage: createJSONStorage(() => zustandStorage),
      // Rehydrate in AppProviders after mount so SSR HTML does not include stale localStorage.
      skipHydration: true,
      partialize: (state) => ({
        products: state.products,
        stockMovements: state.stockMovements,
        activities: state.activities,
      }),
    },
  ),
);
