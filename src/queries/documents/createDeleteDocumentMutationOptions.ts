import { mutationOptions } from "@tanstack/react-query"
import type { QueryClient } from "@tanstack/react-query"
import { deleteDocument } from "@/api/documents"
import { documentsKeys } from "./keys"

export default function createDeleteDocumentMutationOptions(
  queryClient: QueryClient
) {
  return mutationOptions({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: ({ id }) => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.all })
      queryClient.removeQueries({ queryKey: documentsKeys.detail(id) })
    },
  })
}
