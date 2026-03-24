import { queryOptions } from "@tanstack/react-query"
import type { UseQueryOptions } from "@tanstack/react-query"
import { fetchProjectById } from "@/api/projects"
import { projectsKeys } from "./keys"
import type { Project } from "@/types/projects"

export type ProjectDetailQueryOptions<TData = Project, TError = Error> = Omit<
  UseQueryOptions<Project, TError, TData, ReturnType<typeof projectsKeys.detail>>,
  "queryKey" | "queryFn"
>

export default function createProjectDetailQueryOptions<
  TData = Project,
  TError = Error,
>(id: string, options?: ProjectDetailQueryOptions<TData, TError>) {
  return queryOptions({
    ...options,
    queryKey: projectsKeys.detail(id),
    queryFn: () => fetchProjectById(id),
  })
}