import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate, useParams } from "react-router"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import createDeleteDocumentMutationOptions from "@/queries/documents/createDeleteDocumentMutationOptions"
import createDocumentDetailQueryOptions from "@/queries/documents/createDocumentDetailQueryOptions"
import { cn } from "@/lib/utils"
import {
  documentCategoryLabels,
  documentStatusLabels,
} from "@/types/documents"

export function DocumentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const deleteMutation = useMutation(
    createDeleteDocumentMutationOptions(queryClient)
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

  const handleDelete = async () => {
    const shouldDelete = window.confirm("このドキュメントを削除しますか？")

    if (!shouldDelete) {
      return
    }

    await deleteMutation.mutateAsync(document.id)
    navigate("/documents")
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          className={cn(buttonVariants({ variant: "outline" }))}
          to="/documents"
        >
          一覧へ戻る
        </Link>
        <Link
          className={cn(buttonVariants({ variant: "outline" }))}
          to={`/documents/${document.id}/edit`}
        >
          編集する
        </Link>
        <Button
          onClick={() => void handleDelete()}
          type="button"
          variant="destructive"
        >
          {deleteMutation.isPending ? "削除中..." : "削除する"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                  {documentCategoryLabels[document.category]}
                </span>
                <span className="rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {documentStatusLabels[document.status]}
                </span>
              </div>
              <CardTitle>{document.title}</CardTitle>
            </div>
          </div>
          <CardDescription>
            作成日: {new Date(document.createdAt).toLocaleString()} / 更新日:{" "}
            {new Date(document.updatedAt).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="leading-7 text-muted-foreground">
            {document.description || "説明はまだありません。"}
          </p>

          <div className="grid gap-4 rounded-md border bg-muted/30 p-4 text-sm md:grid-cols-2">
            <div>
              <p className="font-medium text-foreground">Project</p>
              <Link
                className="text-muted-foreground underline-offset-4 hover:underline"
                to={`/projects/${document.project.id}`}
              >
                {document.project.code} / {document.project.name}
              </Link>
            </div>
            <div>
              <p className="font-medium text-foreground">Owner</p>
              <p className="text-muted-foreground">{document.ownerName}</p>
              <p className="text-muted-foreground">{document.ownerRole}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Contact</p>
              <a
                className="text-muted-foreground underline-offset-4 hover:underline"
                href={`mailto:${document.ownerEmail}`}
              >
                {document.ownerEmail}
              </a>
              <p className="text-muted-foreground">{document.teamName}</p>
            </div>
            <div className="md:col-span-2">
              <p className="font-medium text-foreground">Tags</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {document.tags.map((tag) => (
                  <span
                    className="rounded-full border px-2 py-1 text-xs text-muted-foreground"
                    key={tag}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-md border bg-muted/40 p-4 text-sm text-muted-foreground">
            このページは `createDocumentDetailQueryOptions(id)` を `useQuery`
            に渡して 1件取得するだけでなく、faker の `person`、`internet`、
            `company`、`hacker`、`date` で作ったメタデータも表示するサンプルです。
          </div>

          {deleteMutation.error ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              削除に失敗しました: {deleteMutation.error.message}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </main>
  )
}
