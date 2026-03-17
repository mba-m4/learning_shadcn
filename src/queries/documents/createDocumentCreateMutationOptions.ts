import { mutationOptions } from "@tanstack/react-query"
import type { QueryClient } from "@tanstack/react-query"
import { createDocument } from "@/api/documents"
import { documentsKeys } from "./keys"
import type { DocumentInput } from "@/types/documents"

export default function createDocumentCreateMutationOptions(
  queryClient: QueryClient
) {
  return mutationOptions({
    mutationFn: (payload: DocumentInput) => createDocument(payload),
    onSuccess: (document) => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.all })
      queryClient.setQueryData(documentsKeys.detail(document.id), document)
    },
  })
}
