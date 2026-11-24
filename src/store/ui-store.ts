/**
 * Layout chrome: collapsed sidebar, mobile drawer, header search.
 * Only `sidebarCollapsed` is persisted; `hasHydrated` is set after localStorage loads.
 */
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { STORAGE_KEYS } from "@/lib/constants";
import { zustandStorage } from "@/lib/storage";

type UiState = {
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  globalSearch: string;
  hasHydrated: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setMobileNavOpen: (open: boolean) => void;
  setGlobalSearch: (value: string) => void;
  setHasHydrated: (value: boolean) => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileNavOpen: false,
      globalSearch: "",
      hasHydrated: false,
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
      setGlobalSearch: (globalSearch) => set({ globalSearch }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: STORAGE_KEYS.ui,
      storage: createJSONStorage(() => zustandStorage),
      // Rehydrate in AppProviders after mount so SSR HTML does not include stale localStorage.
      skipHydration: true,
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
      }),
      onRehydrateStorage: () => () => {
        useUiStore.setState({ hasHydrated: true });
      },
    },
  ),
);
