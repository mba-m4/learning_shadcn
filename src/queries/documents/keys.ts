import type { FetchDocumentsParams } from "@/types/documents"

export const documentsKeys = {
  all: ["documents"] as const,
  list: (params?: FetchDocumentsParams) =>
    [...documentsKeys.all, params] as const,
  detail: (id: string) => [...documentsKeys.all, "detail", id] as const,
}
