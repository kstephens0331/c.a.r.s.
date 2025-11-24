import { create } from 'zustand';

/**
 * Global state store using Zustand
 * Manages application-wide state like theme, search, and filters
 */
export const useStore = create((set) => ({
  // Theme state
  darkMode: false,
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

  // Global search state
  globalSearchQuery: '',
  setGlobalSearchQuery: (query) => set({ globalSearchQuery: query }),
  globalSearchResults: [],
  setGlobalSearchResults: (results) => set({ globalSearchResults: results }),
  globalSearchLoading: false,
  setGlobalSearchLoading: (loading) => set({ globalSearchLoading: loading }),

  // Work orders filter state
  workOrderFilters: {
    status: 'all',
    customer: '',
    dateFrom: '',
    dateTo: '',
  },
  setWorkOrderFilters: (filters) =>
    set((state) => ({
      workOrderFilters: { ...state.workOrderFilters, ...filters },
    })),
  resetWorkOrderFilters: () =>
    set({
      workOrderFilters: {
        status: 'all',
        customer: '',
        dateFrom: '',
        dateTo: '',
      },
    }),

  // Inventory filter state
  inventoryFilters: {
    supplier: 'all',
    lowStock: false,
    searchTerm: '',
  },
  setInventoryFilters: (filters) =>
    set((state) => ({
      inventoryFilters: { ...state.inventoryFilters, ...filters },
    })),
  resetInventoryFilters: () =>
    set({
      inventoryFilters: {
        supplier: 'all',
        lowStock: false,
        searchTerm: '',
      },
    }),
}));
