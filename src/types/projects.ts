import type { z } from "zod"
import {
  projectSchema,
  projectStatusSchema,
  projectStatusValues,
  projectSummarySchema,
} from "@/schema/projects"

export type ProjectStatus = z.infer<typeof projectStatusSchema>

export type ProjectSummary = z.infer<typeof projectSummarySchema>

export type Project = z.infer<typeof projectSchema>

export const projectStatusLabels = {
  planning: "Planning",
  active: "Active",
  maintenance: "Maintenance",
  archived: "Archived",
} satisfies Record<ProjectStatus, string>

export const projectStatusOptions: ReadonlyArray<{
  value: ProjectStatus
  label: string
}> = projectStatusValues.map((value) => ({
  value,
  label: projectStatusLabels[value],
}))