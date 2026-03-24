import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import createProjectsQueryOptions from "@/queries/projects/createProjectsQueryOptions"
import { projectStatusLabels } from "@/types/projects"

export function ProjectsPage() {
  const { data: projects, isLoading, error } = useQuery(
    createProjectsQueryOptions()
  )

  if (isLoading) return <p className="p-6">Loading...</p>
  if (error) return <p className="p-6">Error: {error.message}</p>
  if (!projects) return null

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-sm tracking-[0.2em] text-muted-foreground uppercase">
            Projects Template
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            `@mswjs/data` の relation を使って、documents が属する project を参照するサンプルです。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link className={cn(buttonVariants({ variant: "outline" }))} to="/">
            Home
          </Link>
          <Link
            className={cn(buttonVariants({ variant: "outline" }))}
            to="/documents"
          >
            Documents
          </Link>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {projects.map((project) => (
          <Card key={project.id}>
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
                <div className="text-right text-xs text-muted-foreground">
                  <p>{project.ownerName}</p>
                  <p>{project.teamName}</p>
                </div>
              </div>
              <CardDescription>
                Documents: {project.documentCount} / 更新日: {new Date(project.updatedAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-muted-foreground">
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

              <div className="flex flex-wrap gap-3">
                <Link
                  className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
                  to={`/projects/${project.id}`}
                >
                  詳細
                </Link>
                <a
                  className={cn(buttonVariants({ size: "sm", variant: "ghost" }))}
                  href={project.repositoryUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Repository
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}