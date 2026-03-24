import { queryOptions } from "@tanstack/react-query"
import type { UseQueryOptions } from "@tanstack/react-query"
import { fetchProjects } from "@/api/projects"
import { projectsKeys } from "./keys"
import type { Project } from "@/types/projects"

export type ProjectsQueryOptions<TData = Project[], TError = Error> = Omit<
  UseQueryOptions<Project[], TError, TData, ReturnType<typeof projectsKeys.list>>,
  "queryKey" | "queryFn"
>

export default function createProjectsQueryOptions<
  TData = Project[],
  TError = Error,
>(options?: ProjectsQueryOptions<TData, TError>) {
  return queryOptions({
    ...options,
    queryKey: projectsKeys.list(),
    queryFn: fetchProjects,
  })
}