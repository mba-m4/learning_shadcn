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
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
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
          <CardTitle>{document.title}</CardTitle>
          <CardDescription>
            作成日: {new Date(document.createdAt).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="leading-7 text-muted-foreground">
            {document.description || "説明はまだありません。"}
          </p>

          <div className="rounded-md border bg-muted/40 p-4 text-sm text-muted-foreground">
            このページは `createDocumentDetailQueryOptions(id)` を `useQuery`
            に渡して 1件取得するサンプルです。
          </div>

          {deleteMutation.error ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              削除に失敗しました: {deleteMutation.error.message}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
