import { queryOptions } from "@tanstack/react-query"
import type { UseQueryOptions } from "@tanstack/react-query"
import { fetchDocuments } from "@/api/documents"
import { documentsKeys } from "./keys"
import type { Document, FetchDocumentsParams } from "@/types/documents"

export type DocumentsQueryOptions<TData = Document[], TError = Error> = Omit<
  UseQueryOptions<
    Document[],
    TError,
    TData,
    ReturnType<typeof documentsKeys.list>
  >,
  "queryKey" | "queryFn"
>

export default function createDocumentsQueryOptions<
  TData = Document[],
  TError = Error,
>(
  params?: FetchDocumentsParams,
  options?: DocumentsQueryOptions<TData, TError>
) {
  return queryOptions({
    ...options,
    queryKey: documentsKeys.list(params),
    queryFn: () => fetchDocuments(params),
  })
}
