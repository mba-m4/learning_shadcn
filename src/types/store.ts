import type { DocumentSortOrder } from "@/types/documents"

export type UserStore = {
  user: string | null
  setUser: (user: string) => void
}

export type DocumentsUiStore = {
  keyword: string
  sortOrder: DocumentSortOrder
  pendingDeleteId: string | null
  setKeyword: (keyword: string) => void
  setSortOrder: (sortOrder: DocumentSortOrder) => void
  setPendingDeleteId: (documentId: string | null) => void
  resetFilters: () => void
}
