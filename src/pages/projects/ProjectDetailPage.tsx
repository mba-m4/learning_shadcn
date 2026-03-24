import { useQuery } from "@tanstack/react-query"
import { Link, useParams } from "react-router"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import createDocumentsQueryOptions from "@/queries/documents/createDocumentsQueryOptions"
import createProjectDetailQueryOptions from "@/queries/projects/createProjectDetailQueryOptions"
import { projectStatusLabels } from "@/types/projects"

export function ProjectDetailPage() {
  const { id } = useParams()
  const {
    data: project,
    isLoading,
    error,
  } = useQuery(
    createProjectDetailQueryOptions(id ?? "", {
      enabled: Boolean(id),
    })
  )
  const {
    data: documents,
    isLoading: isDocumentsLoading,
    error: documentsError,
  } = useQuery(
    createDocumentsQueryOptions(
      { projectId: id ?? "", sort: "newest" },
      { enabled: Boolean(id) }
    )
  )

  if (!id) {
    return <p className="p-6">Project ID is missing.</p>
  }

  if (isLoading || isDocumentsLoading) return <p className="p-6">Loading...</p>
  if (error) return <p className="p-6">Error: {error.message}</p>
  if (documentsError) return <p className="p-6">Error: {documentsError.message}</p>
  if (!project) return <p className="p-6">Project not found.</p>

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          className={cn(buttonVariants({ variant: "outline" }))}
          to="/projects"
        >
          Projects へ戻る
        </Link>
        <Link
          className={cn(buttonVariants({ variant: "outline" }))}
          to="/documents"
        >
          Documents へ戻る
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                  {project.code}
                </span>
                <span className="rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {projectStatusLabels[project.status]}
                </span>
              </div>
              <CardTitle>{project.name}</CardTitle>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>{project.ownerName}</p>
              <a
                className="underline-offset-4 hover:underline"
                href={`mailto:${project.ownerEmail}`}
              >
                {project.ownerEmail}
              </a>
            </div>
          </div>
          <CardDescription>
            Team: {project.teamName} / Documents: {project.documentCount}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">
            {project.summary}
          </p>

          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                className="rounded-full border px-2 py-1 text-xs text-muted-foreground"
                key={tag}
              >
                #{tag}
              </span>
            ))}
          </div>

          <a
            className={cn(buttonVariants({ variant: "outline" }))}
            href={project.repositoryUrl}
            rel="noreferrer"
            target="_blank"
          >
            Repository を開く
          </a>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Documents</CardTitle>
          <CardDescription>
            project detail と documents list を別 query で組み合わせ、relation を UI で見せるサンプルです。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {documents && documents.length > 0 ? (
            documents.map((document) => (
              <div
                className="flex flex-col gap-3 rounded-md border p-4 md:flex-row md:items-start md:justify-between"
                key={document.id}
              >
                <div className="space-y-1">
                  <p className="font-medium">{document.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {document.ownerName} / {document.ownerRole}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(document.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
                    to={`/documents/${document.id}`}
                  >
                    詳細
                  </Link>
                  <Link
                    className={cn(buttonVariants({ size: "sm", variant: "ghost" }))}
                    to={`/documents/${document.id}/edit`}
                  >
                    編集
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              この project に紐づく document はありません。
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  )
}