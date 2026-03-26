import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router"
import { DocumentForm } from "@/components/documents/DocumentForm"
import createDocumentDetailQueryOptions from "@/queries/documents/createDocumentDetailQueryOptions"
import createUpdateDocumentMutationOptions from "@/queries/documents/createUpdateDocumentMutationOptions"
import type { DocumentInput } from "@/types/documents"

export function DocumentEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const updateMutation = useMutation(
    createUpdateDocumentMutationOptions(queryClient)
  )

  const {
    data: document,
    isLoading,
    error,
  } = useQuery(
    createDocumentDetailQueryOptions(id ?? "", {
      enabled: Boolean(id),
    })
  )

  if (!id) {
    return <p className="p-6">Document ID is missing.</p>
  }

  if (isLoading) return <p className="p-6">Loading...</p>
  if (error) return <p className="p-6">Error: {error.message}</p>
  if (!document) return <p className="p-6">Document not found.</p>

  const initialValues: DocumentInput = {
    title: document.title,
    description: document.description,
  }

  const handleSubmit = async (values: DocumentInput) => {
    const updatedDocument = await updateMutation.mutateAsync({
      id,
      payload: values,
    })

    navigate(`/documents/${updatedDocument.id}`)
  }

  return (
    <div className="py-2">
      <DocumentForm
        cancelTo={`/documents/${id}`}
        description="既存ドキュメントを編集して、詳細キャッシュと一覧の再取得を確認できます。"
        errorMessage={updateMutation.error?.message ?? null}
        initialValues={initialValues}
        key={id}
        onSubmit={handleSubmit}
        submitLabel="更新する"
        title="Document Edit"
      />
    </div>
  )
}
