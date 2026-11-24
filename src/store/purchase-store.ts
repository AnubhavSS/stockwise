/**
 * Purchase orders and suppliers.
 *
 * Placing an order does not change stock. `receivePurchaseItems` is the
 * only path that adds inventory. Orders with received goods cannot be cancelled.
 */
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { mockPurchases } from "@/data/mock-purchases";
import { mockSuppliers } from "@/data/mock-suppliers";
import {
  calculatePurchaseLineTotal,
  calculatePurchaseTotals,
  canCancelPurchase,
  canEditPurchase,
  canReceivePurchase,
  deriveReceiptStatus,
  remainingQuantity,
} from "@/features/purchase/calculations";
import { STORAGE_KEYS } from "@/lib/constants";
import { zustandStorage } from "@/lib/storage";
import { purchaseQuantityChange } from "@/lib/stock-transactions";
import { useInventoryStore } from "@/store/inventory-store";
import type {
  Purchase,
  PurchaseDraftInput,
  PurchaseItem,
  PurchaseReceiptLine,
} from "@/types/purchase";
import type { Supplier } from "@/types/supplier";

type ActionResult<T> = { ok: true; purchase: T } | { ok: false; error: string };

type PurchaseState = {
  purchases: Purchase[];
  suppliers: Supplier[];
  setPurchases: (purchases: Purchase[]) => void;
  setSuppliers: (suppliers: Supplier[]) => void;
  addSupplier: (
    input: Omit<Supplier, "id" | "status" | "leadTimeDays"> & { leadTimeDays?: number },
  ) => Supplier;
  createPurchase: (input: PurchaseDraftInput, asDraft: boolean) => ActionResult<Purchase>;
  updatePurchase: (id: string, input: PurchaseDraftInput) => ActionResult<Purchase>;
  receivePurchaseItems: (
    id: string,
    receipts: PurchaseReceiptLine[],
  ) => ActionResult<Purchase>;
  cancelPurchase: (id: string) => ActionResult<Purchase>;
  getPurchaseById: (id: string) => Purchase | undefined;
  reset: () => void;
};

const initialState = {
  purchases: mockPurchases,
  suppliers: mockSuppliers,
};

function nextPurchaseNumber(purchases: Purchase[]): string {
  const numbers = purchases.map((purchase) => {
    const match = purchase.purchaseOrderNumber.match(/(\d+)$/);
    return match ? Number(match[1]) : 0;
  });
  return `PUR-${Math.max(1000, ...numbers) + 1}`;
}

function normalizeItems(
  items: PurchaseDraftInput["items"],
  previous?: PurchaseItem[],
): PurchaseItem[] {
  return items.map((item) => {
    const existing = previous?.find((entry) => entry.productId === item.productId);
    const receivedQuantity = existing?.receivedQuantity ?? item.receivedQuantity ?? 0;
    return {
      productId: item.productId,
      quantity: item.quantity,
      unitCost: item.unitCost,
      discount: item.discount,
      lineTotal: calculatePurchaseLineTotal(item.quantity, item.unitCost, item.discount),
      receivedQuantity,
    };
  });
}

function withTotals(input: PurchaseDraftInput, items: PurchaseItem[]) {
  return calculatePurchaseTotals({
    items,
    taxRate: input.taxRate,
    paymentStatus: input.paymentStatus,
    amountPaid: input.amountPaid,
  });
}

export const usePurchaseStore = create<PurchaseState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setPurchases: (purchases) => set({ purchases }),
      setSuppliers: (suppliers) => set({ suppliers }),
      addSupplier: (input) => {
        const supplier: Supplier = {
          ...input,
          id: `supp-${crypto.randomUUID()}`,
          status: "active",
          leadTimeDays: input.leadTimeDays ?? 5,
        };
        set({ suppliers: [supplier, ...get().suppliers] });
        return supplier;
      },
      createPurchase: (input, asDraft) => {
        if (!input.supplierId) {
          return { ok: false, error: "Select a supplier." };
        }
        if (input.items.length === 0) {
          return { ok: false, error: "Add at least one product." };
        }

        const items = normalizeItems(input.items);
        const totals = withTotals(input, items);
        const now = new Date().toISOString();
        const purchase: Purchase = {
          id: `po-${crypto.randomUUID()}`,
          purchaseOrderNumber: nextPurchaseNumber(get().purchases),
          supplierId: input.supplierId,
          items,
          ...totals,
          taxRate: input.taxRate,
          paymentMethod: input.paymentMethod,
          status: asDraft ? "draft" : "ordered",
          date: input.date || now,
          expectedDate: input.expectedDate || now,
          receivedDate: null,
          notes: input.notes.trim(),
          createdAt: now,
          receipts: [],
        };

        set({ purchases: [purchase, ...get().purchases] });
        return { ok: true, purchase };
      },
      updatePurchase: (id, input) => {
        const current = get().purchases.find((purchase) => purchase.id === id);
        if (!current) {
          return { ok: false, error: "Purchase order was not found." };
        }
        if (!canEditPurchase(current) && current.status !== "partially_received") {
          return { ok: false, error: "This purchase order can no longer be edited." };
        }

        const items = normalizeItems(input.items, current.items);
        for (const item of items) {
          if (item.quantity < item.receivedQuantity) {
            return {
              ok: false,
              error: "Ordered quantity cannot be lower than the quantity already received.",
            };
          }
        }

        if (
          current.status === "partially_received" &&
          JSON.stringify(items.map((item) => item.productId).sort()) !==
            JSON.stringify(current.items.map((item) => item.productId).sort())
        ) {
          return {
            ok: false,
            error: "Products cannot be changed after goods have been received.",
          };
        }

        const totals = withTotals(input, items);
        const status =
          current.status === "draft" || current.status === "cancelled"
            ? current.status
            : deriveReceiptStatus(items);

        const purchase: Purchase = {
          ...current,
          supplierId: input.supplierId,
          items,
          ...totals,
          taxRate: input.taxRate,
          paymentMethod: input.paymentMethod,
          status,
          date: input.date || current.date,
          expectedDate: input.expectedDate || current.expectedDate,
          notes: input.notes.trim(),
        };

        set({
          purchases: get().purchases.map((item) => (item.id === id ? purchase : item)),
        });
        return { ok: true, purchase };
      },
      receivePurchaseItems: (id, receipts) => {
        const current = get().purchases.find((purchase) => purchase.id === id);
        if (!current) {
          return { ok: false, error: "Purchase order was not found." };
        }
        if (!canReceivePurchase(current)) {
          return { ok: false, error: "Goods can only be received against open orders." };
        }

        const incoming = receipts.filter((line) => line.quantity > 0);
        if (incoming.length === 0) {
          return { ok: false, error: "Enter a quantity to receive." };
        }

        const items = current.items.map((item) => ({ ...item }));
        for (const line of incoming) {
          const item = items.find((entry) => entry.productId === line.productId);
          if (!item) {
            return { ok: false, error: "A received product is not on this purchase order." };
          }
          if (line.quantity > remainingQuantity(item)) {
            return {
              ok: false,
              error: `Cannot receive more than ${remainingQuantity(item)} remaining units.`,
            };
          }
          item.receivedQuantity += line.quantity;
        }

        const now = new Date().toISOString();
        // Stock increases only on this receive step, never when the PO is created.
        const inventory = useInventoryStore.getState().recordMovements(
          incoming.map((line) => ({
            productId: line.productId,
            type: "purchase",
            quantityChange: purchaseQuantityChange(line.quantity),
            referenceId: current.id,
            remarks: `Received through ${current.purchaseOrderNumber}`,
            createdAt: now,
          })),
          {
            type: "purchase_received",
            title: `Purchase ${current.purchaseOrderNumber} received`,
            description: `${incoming.reduce((sum, line) => sum + line.quantity, 0)} units added to stock`,
            referenceId: current.id,
            amount: current.totalAmount,
            quantityChange: incoming.reduce((sum, line) => sum + line.quantity, 0),
          },
        );

        if (!inventory.ok) {
          return inventory;
        }

        const status = deriveReceiptStatus(items);
        const purchase: Purchase = {
          ...current,
          items,
          status,
          receivedDate: status === "received" ? now : current.receivedDate,
          receipts: [
            {
              id: `rcpt-${crypto.randomUUID()}`,
              createdAt: now,
              items: incoming,
            },
            ...current.receipts,
          ],
        };

        set({
          purchases: get().purchases.map((item) => (item.id === id ? purchase : item)),
        });
        return { ok: true, purchase };
      },
      cancelPurchase: (id) => {
        const current = get().purchases.find((purchase) => purchase.id === id);
        if (!current) {
          return { ok: false, error: "Purchase order was not found." };
        }
        if (!canCancelPurchase(current)) {
          return {
            ok: false,
            error: "Orders with received stock cannot be cancelled. Received inventory is kept.",
          };
        }

        const purchase: Purchase = { ...current, status: "cancelled" };
        set({
          purchases: get().purchases.map((item) => (item.id === id ? purchase : item)),
        });
        return { ok: true, purchase };
      },
      getPurchaseById: (id) => get().purchases.find((purchase) => purchase.id === id),
      reset: () => set(initialState),
    }),
    {
      name: STORAGE_KEYS.purchases,
      storage: createJSONStorage(() => zustandStorage),
      // Rehydrate in AppProviders after mount so SSR HTML does not include stale localStorage.
      skipHydration: true,
      partialize: (state) => ({
        purchases: state.purchases,
        suppliers: state.suppliers,
      }),
    },
  ),
);
