import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import { DocumentForm } from "@/components/documents/DocumentForm"
import createDocumentCreateMutationOptions from "@/queries/documents/createDocumentCreateMutationOptions"
import type { DocumentInput } from "@/types/documents"

const defaultDocumentValues: DocumentInput = {
  title: "",
  description: "",
}

export function DocumentCreatePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const createMutation = useMutation(
    createDocumentCreateMutationOptions(queryClient)
  )

  const handleSubmit = async (values: DocumentInput) => {
    const nextDocument = await createMutation.mutateAsync(values)
    navigate(`/documents/${nextDocument.id}`)
  }

  return (
    <div className="py-2">
      <DocumentForm
        cancelTo="/documents"
        description="新しいドキュメントを追加して、一覧と詳細の再取得フローを確認できます。"
        errorMessage={createMutation.error?.message ?? null}
        initialValues={defaultDocumentValues}
        onSubmit={handleSubmit}
        submitLabel="作成する"
        title="Document Create"
      />
    </div>
  )
}
