import { mutationOptions } from "@tanstack/react-query"
import type { QueryClient } from "@tanstack/react-query"
import { updateDocument } from "@/api/documents"
import { documentsKeys } from "./keys"
import type { DocumentInput } from "@/types/documents"

type UpdateDocumentVariables = {
  id: string
  payload: DocumentInput
}

export default function createUpdateDocumentMutationOptions(
  queryClient: QueryClient
) {
  return mutationOptions({
    mutationFn: ({ id, payload }: UpdateDocumentVariables) =>
      updateDocument(id, payload),
    onSuccess: (document) => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.all })
      queryClient.setQueryData(documentsKeys.detail(document.id), document)
    },
  })
}
