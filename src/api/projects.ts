import { api } from "@/api/client"
import { projectApiPaths } from "@/api/paths"
import { projectSchema, projectsSchema } from "@/schema/projects"
import type { Project } from "@/types/projects"

export const fetchProjects = async (): Promise<Project[]> => {
  const res = await api.get(projectApiPaths.list)
  return projectsSchema.parse(res.data)
}

export const fetchProjectById = async (id: string): Promise<Project> => {
  const res = await api.get(projectApiPaths.detail(id))
  return projectSchema.parse(res.data)
}