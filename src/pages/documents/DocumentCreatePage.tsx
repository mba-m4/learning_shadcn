import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import { DocumentForm } from "@/components/documents/DocumentForm"
import createDocumentCreateMutationOptions from "@/queries/documents/createDocumentCreateMutationOptions"
import createProjectsQueryOptions from "@/queries/projects/createProjectsQueryOptions"
import type { DocumentInput } from "@/types/documents"

export function DocumentCreatePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: projects, isLoading, error } = useQuery(
    createProjectsQueryOptions()
  )
  const createMutation = useMutation(
    createDocumentCreateMutationOptions(queryClient)
  )

  if (isLoading) return <p className="p-6">Loading...</p>
  if (error) return <p className="p-6">Error: {error.message}</p>
  if (!projects || projects.length === 0) {
    return <p className="p-6">Project data is missing.</p>
  }

  const initialValues: DocumentInput = {
    title: "",
    description: "",
    projectId: projects[0].id,
    category: "runbook",
    status: "draft",
  }

  const projectOptions = projects.map((project) => ({
    value: project.id,
    label: `${project.code} | ${project.name}`,
  }))

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
        initialValues={initialValues}
        onSubmit={handleSubmit}
        projectOptions={projectOptions}
        submitLabel="作成する"
        title="Document Create"
      />
    </div>
  )
}
