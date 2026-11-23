import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { mockCustomers } from "@/data/mock-customers";
import { mockSales } from "@/data/mock-sales";
import { STORAGE_KEYS } from "@/lib/constants";
import { zustandStorage } from "@/lib/storage";
import type { Customer } from "@/types/customer";
import type { Sale } from "@/types/sales";

type SalesState = {
  sales: Sale[];
  customers: Customer[];
  setSales: (sales: Sale[]) => void;
  setCustomers: (customers: Customer[]) => void;
  reset: () => void;
};

const initialState = {
  sales: mockSales,
  customers: mockCustomers,
};

export const useSalesStore = create<SalesState>()(
  persist(
    (set) => ({
      ...initialState,
      setSales: (sales) => set({ sales }),
      setCustomers: (customers) => set({ customers }),
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
