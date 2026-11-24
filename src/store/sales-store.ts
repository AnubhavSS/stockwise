import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { mockCustomers } from "@/data/mock-customers";
import { mockSales } from "@/data/mock-sales";
import { calculateSaleTotals } from "@/features/sales/calculations";
import { STORAGE_KEYS } from "@/lib/constants";
import { zustandStorage } from "@/lib/storage";
import { saleQuantityChange } from "@/lib/stock-transactions";
import { useInventoryStore } from "@/store/inventory-store";
import type { Customer } from "@/types/customer";
import type { Sale, SaleDraftInput } from "@/types/sales";

type ActionResult<T> = { ok: true; sale: T } | { ok: false; error: string };

type SalesState = {
  sales: Sale[];
  customers: Customer[];
  setSales: (sales: Sale[]) => void;
  setCustomers: (customers: Customer[]) => void;
  addCustomer: (input: Omit<Customer, "id" | "outstandingBalance" | "status">) => Customer;
  createSale: (input: SaleDraftInput, complete: boolean) => ActionResult<Sale>;
  updateSale: (id: string, input: SaleDraftInput) => ActionResult<Sale>;
  completeSale: (id: string) => ActionResult<Sale>;
  cancelSale: (id: string) => ActionResult<Sale>;
  getSaleById: (id: string) => Sale | undefined;
  reset: () => void;
};

const initialState = {
  sales: mockSales,
  customers: mockCustomers,
};

function nextInvoiceNumber(sales: Sale[]): string {
  const numbers = sales.map((sale) => {
    const match = sale.invoiceNumber.match(/(\d+)$/);
    return match ? Number(match[1]) : 0;
  });
  const next = Math.max(1000, ...numbers) + 1;
  return `SALE-${next}`;
}

function withTotals(input: SaleDraftInput) {
  return calculateSaleTotals({
    items: input.items,
    taxRate: input.taxRate,
    paymentStatus: input.paymentStatus,
    amountPaid: input.amountPaid,
  });
}

function refreshOutstanding(customers: Customer[], sales: Sale[]): Customer[] {
  return customers.map((customer) => ({
    ...customer,
    outstandingBalance: sales
      .filter(
        (sale) =>
          sale.customerId === customer.id &&
          sale.status === "completed" &&
          sale.remainingBalance > 0,
      )
      .reduce((sum, sale) => sum + sale.remainingBalance, 0),
  }));
}

function applyInventoryForSale(sale: Sale, reverse: boolean) {
  const movements = sale.items.map((item) => ({
    productId: item.productId,
    type: "sale" as const,
    quantityChange: reverse
      ? Math.abs(item.quantity)
      : saleQuantityChange(item.quantity),
    referenceId: sale.id,
    remarks: reverse
      ? `Sale cancelled: ${sale.invoiceNumber}`
      : `Sold through ${sale.invoiceNumber}`,
    createdAt: new Date().toISOString(),
  }));

  return useInventoryStore.getState().recordMovements(movements, {
    type: reverse ? "stock_adjusted" : "sale_created",
    title: reverse
      ? `Sale ${sale.invoiceNumber} cancelled`
      : `Sale ${sale.invoiceNumber} completed`,
    description: reverse
      ? "Stock restored after cancellation"
      : `Invoice raised for ${sale.items.length} line${sale.items.length === 1 ? "" : "s"}`,
    referenceId: sale.id,
    amount: sale.totalAmount,
    quantityChange: reverse
      ? sale.items.reduce((sum, item) => sum + item.quantity, 0)
      : -sale.items.reduce((sum, item) => sum + item.quantity, 0),
  });
}

export const useSalesStore = create<SalesState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setSales: (sales) => set({ sales }),
      setCustomers: (customers) => set({ customers }),
      addCustomer: (input) => {
        const customer: Customer = {
          ...input,
          id: `cust-${crypto.randomUUID()}`,
          status: "active",
          outstandingBalance: 0,
        };
        set({ customers: [customer, ...get().customers] });
        return customer;
      },
      createSale: (input, complete) => {
        if (input.items.length === 0) {
          return { ok: false, error: "Add at least one product." };
        }

        const totals = withTotals(input);
        const now = new Date().toISOString();
        const sale: Sale = {
          id: `sale-${crypto.randomUUID()}`,
          invoiceNumber: nextInvoiceNumber(get().sales),
          customerId: input.customerId,
          items: input.items,
          ...totals,
          taxRate: input.taxRate,
          paymentMethod: input.paymentMethod,
          status: complete ? "completed" : "draft",
          date: input.date || now,
          notes: input.notes.trim(),
          createdAt: now,
          inventoryApplied: false,
        };

        if (complete) {
          const inventory = applyInventoryForSale(sale, false);
          if (!inventory.ok) {
            return inventory;
          }
          sale.inventoryApplied = true;
        }

        const sales = [sale, ...get().sales];
        set({
          sales,
          customers: refreshOutstanding(get().customers, sales),
        });
        return { ok: true, sale };
      },
      updateSale: (id, input) => {
        const current = get().sales.find((sale) => sale.id === id);
        if (!current) {
          return { ok: false, error: "Sale was not found." };
        }
        if (current.status !== "draft") {
          return { ok: false, error: "Only draft sales can be edited." };
        }
        if (input.items.length === 0) {
          return { ok: false, error: "Add at least one product." };
        }

        const totals = withTotals(input);
        const sale: Sale = {
          ...current,
          customerId: input.customerId,
          items: input.items,
          ...totals,
          taxRate: input.taxRate,
          paymentMethod: input.paymentMethod,
          date: input.date || current.date,
          notes: input.notes.trim(),
        };
        const sales = get().sales.map((item) => (item.id === id ? sale : item));
        set({
          sales,
          customers: refreshOutstanding(get().customers, sales),
        });
        return { ok: true, sale };
      },
      completeSale: (id) => {
        const current = get().sales.find((sale) => sale.id === id);
        if (!current) {
          return { ok: false, error: "Sale was not found." };
        }
        if (current.status === "cancelled") {
          return { ok: false, error: "A cancelled sale cannot be completed." };
        }
        if (current.status === "completed") {
          return { ok: false, error: "This sale is already completed." };
        }

        const sale: Sale = { ...current, status: "completed" };
        if (!sale.inventoryApplied) {
          const inventory = applyInventoryForSale(sale, false);
          if (!inventory.ok) {
            return inventory;
          }
          sale.inventoryApplied = true;
        }

        const sales = get().sales.map((item) => (item.id === id ? sale : item));
        set({
          sales,
          customers: refreshOutstanding(get().customers, sales),
        });
        return { ok: true, sale };
      },
      cancelSale: (id) => {
        const current = get().sales.find((sale) => sale.id === id);
        if (!current) {
          return { ok: false, error: "Sale was not found." };
        }
        if (current.status !== "completed") {
          return { ok: false, error: "Only completed sales can be cancelled." };
        }

        const sale: Sale = {
          ...current,
          status: "cancelled",
          paymentStatus: current.paymentStatus,
        };

        if (current.inventoryApplied) {
          const inventory = applyInventoryForSale(current, true);
          if (!inventory.ok) {
            return inventory;
          }
          sale.inventoryApplied = false;
        }

        const sales = get().sales.map((item) => (item.id === id ? sale : item));
        set({
          sales,
          customers: refreshOutstanding(get().customers, sales),
        });
        return { ok: true, sale };
      },
      getSaleById: (id) => get().sales.find((sale) => sale.id === id),
      reset: () => set(initialState),
    }),
    {
      name: STORAGE_KEYS.sales,
      storage: createJSONStorage(() => zustandStorage),
      skipHydration: true,
      partialize: (state) => ({
        sales: state.sales,
        customers: state.customers,
      }),
    },
  ),
);
