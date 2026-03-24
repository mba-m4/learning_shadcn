import { z } from "zod"
import { projectSummarySchema } from "@/schema/projects"

export const documentCategoryValues = [
  "runbook",
  "guide",
  "incident",
  "release",
  "memo",
] as const

export const documentStatusValues = [
  "draft",
  "review",
  "published",
  "archived",
] as const

export const documentCategorySchema = z.enum(documentCategoryValues)
export const documentStatusSchema = z.enum(documentStatusValues)

export const documentSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().default(""),
  project: projectSummarySchema,
  category: documentCategorySchema,
  status: documentStatusSchema,
  ownerName: z.string(),
  ownerRole: z.string(),
  ownerEmail: z.string().email(),
  teamName: z.string(),
  tags: z.array(z.string()).default([]),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export const documentsSchema = z.array(documentSchema)
export const documentInputSchema = z.object({
  title: z.string().trim().min(1, "タイトルは必須です"),
  description: z.string().trim(),
  projectId: z.string().trim().min(1, "プロジェクトは必須です"),
  category: documentCategorySchema,
  status: documentStatusSchema,
})
export const deletedDocumentSchema = z.object({
  id: z.string(),
})
