import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "react-router"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import createDeleteDocumentMutationOptions from "@/queries/documents/createDeleteDocumentMutationOptions"
import createDocumentsQueryOptions from "@/queries/documents/createDocumentsQueryOptions"
import { useDocumentsUiStore } from "@/store/useDocumentsUiStore"
import {
  documentCategoryLabels,
  documentStatusLabels,
} from "@/types/documents"
import { cn } from "@/lib/utils"

export function DocumentsPage() {
  const queryClient = useQueryClient()
  const {
    keyword,
    sortOrder,
    pendingDeleteId,
    setKeyword,
    setSortOrder,
    setPendingDeleteId,
    resetFilters,
  } = useDocumentsUiStore()
  const deleteMutation = useMutation(
    createDeleteDocumentMutationOptions(queryClient)
  )
  const params = {
    keyword: keyword.trim() || undefined,
    sort: sortOrder,
  } as const
  const {
    data: documents,
    isLoading,
    error,
  } = useQuery(createDocumentsQueryOptions(params))

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id)
    setPendingDeleteId(null)
  }

  if (isLoading) return <p className="p-6">Loading...</p>
  if (error) return <p className="p-6">Error: {error.message}</p>
  if (!Array.isArray(documents)) return null

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-sm tracking-[0.2em] text-muted-foreground uppercase">
            Documents Template
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Documents</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            一覧、検索、詳細、作成、編集、削除に加えて、faker と @mswjs/data
            で生成したメタデータの扱いも試せるテンプレートです。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link className={cn(buttonVariants({ variant: "outline" }))} to="/">
            Home
          </Link>
          <Link
            className={cn(buttonVariants({ variant: "default" }))}
            to="/documents/new"
          >
            新規作成
          </Link>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">一覧条件</CardTitle>
          <CardDescription>
            Zustand に保持した検索キーワードと並び順を query params
            に変換しています。
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_auto] md:items-end">
          <label className="grid gap-2 text-sm font-medium">
            キーワード
            <input
              className="h-11 rounded-md border border-input bg-background px-3 text-sm transition outline-none focus:border-ring focus:ring-3 focus:ring-ring/30"
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="タイトルや説明で絞り込む"
              value={keyword}
            />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            並び順
            <select
              className="h-11 rounded-md border border-input bg-background px-3 text-sm transition outline-none focus:border-ring focus:ring-3 focus:ring-ring/30"
              onChange={(event) =>
                setSortOrder(
                  event.target.value as "newest" | "oldest" | "title"
                )
              }
              value={sortOrder}
            >
              <option value="newest">新しい順</option>
              <option value="oldest">古い順</option>
              <option value="title">タイトル順</option>
            </select>
          </label>

          <Button onClick={resetFilters} type="button" variant="outline">
            条件をリセット
          </Button>
        </CardContent>
      </Card>

      {deleteMutation.error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          削除に失敗しました: {deleteMutation.error.message}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {documents.map((doc) => (
          <Card key={doc.id}>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                      {documentCategoryLabels[doc.category]}
                    </span>
                    <span className="rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      {documentStatusLabels[doc.status]}
                    </span>
                  </div>
                  <CardTitle>{doc.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Project: {doc.project.code} / {doc.project.name}
                  </p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>{doc.ownerName}</p>
                  <p>{doc.teamName}</p>
                </div>
              </div>
              <CardDescription>
                作成日: {new Date(doc.createdAt).toLocaleDateString()} / 更新日:{" "}
                {new Date(doc.updatedAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-muted-foreground">
                {doc.description || "説明はまだありません。"}
              </p>

              <dl className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                <div>
                  <dt className="font-medium text-foreground">Owner</dt>
                  <dd>
                    {doc.ownerName} / {doc.ownerRole}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">Contact</dt>
                  <dd>{doc.ownerEmail}</dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">Project</dt>
                  <dd>
                    <Link className="underline-offset-4 hover:underline" to={`/projects/${doc.project.id}`}>
                      {doc.project.code} / {doc.project.name}
                    </Link>
                  </dd>
                </div>
              </dl>

              <div className="flex flex-wrap gap-2">
                {doc.tags.map((tag) => (
                  <span
                    className="rounded-full border px-2 py-1 text-xs text-muted-foreground"
                    key={tag}
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  className={cn(
                    buttonVariants({ size: "sm", variant: "outline" })
                  )}
                  to={`/documents/${doc.id}`}
                >
                  詳細
                </Link>
                <Link
                  className={cn(
                    buttonVariants({ size: "sm", variant: "outline" })
                  )}
                  to={`/documents/${doc.id}/edit`}
                >
                  編集
                </Link>
                {pendingDeleteId === doc.id ? (
                  <>
                    <Button
                      onClick={() => void handleDelete(doc.id)}
                      size="sm"
                      type="button"
                      variant="destructive"
                    >
                      {deleteMutation.isPending ? "削除中..." : "削除を確定"}
                    </Button>
                    <Button
                      onClick={() => setPendingDeleteId(null)}
                      size="sm"
                      type="button"
                      variant="ghost"
                    >
                      戻す
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setPendingDeleteId(doc.id)}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    削除
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            条件に一致するドキュメントはありません。新規作成するか、検索条件を見直してください。
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
