import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { DocumentsUiStore } from "@/types/store"

export const useDocumentsUiStore = create<DocumentsUiStore>()(
  persist(
    (set) => ({
      keyword: "",
      sortOrder: "newest",
      pendingDeleteId: null,
      setKeyword: (keyword) => set({ keyword }),
      setSortOrder: (sortOrder) => set({ sortOrder }),
      setPendingDeleteId: (pendingDeleteId) => set({ pendingDeleteId }),
      resetFilters: () => set({ keyword: "", sortOrder: "newest" }),
    }),
    {
      name: "documents-ui-store",
      partialize: (state) => ({
        keyword: state.keyword,
        sortOrder: state.sortOrder,
      }),
    }
  )
)
