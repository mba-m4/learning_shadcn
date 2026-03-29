import { z } from "zod"

export const projectStatusValues = [
  "planning",
  "active",
  "maintenance",
  "archived",
] as const

export const projectStatusSchema = z.enum(projectStatusValues)

export const projectSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  status: projectStatusSchema,
})

export const projectSchema = projectSummarySchema.extend({
  summary: z.string(),
  ownerName: z.string(),
  ownerEmail: z.string().email(),
  teamName: z.string(),
  repositoryUrl: z.string().url(),
  tags: z.array(z.string()).default([]),
  documentCount: z.number().int().nonnegative(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const projectsSchema = z.array(projectSchema)