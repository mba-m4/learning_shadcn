import { queryOptions } from "@tanstack/react-query"
import type { UseQueryOptions } from "@tanstack/react-query"
import { fetchDocumentById } from "@/api/documents"
import { documentsKeys } from "./keys"
import type { Document } from "@/types/documents"

export type DocumentDetailQueryOptions<TData = Document, TError = Error> = Omit<
  UseQueryOptions<
    Document,
    TError,
    TData,
    ReturnType<typeof documentsKeys.detail>
  >,
  "queryKey" | "queryFn"
>

export default function createDocumentDetailQueryOptions<
  TData = Document,
  TError = Error,
>(id: string, options?: DocumentDetailQueryOptions<TData, TError>) {
  return queryOptions({
    ...options,
    queryKey: documentsKeys.detail(id),
    queryFn: () => fetchDocumentById(id),
  })
}
