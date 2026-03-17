import { z } from "zod"

export const documentSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().default(""),
  createdAt: z.coerce.date(),
})
export const documentsSchema = z.array(documentSchema)
export const documentInputSchema = z.object({
  title: z.string().trim().min(1, "タイトルは必須です"),
  description: z.string().trim(),
})
export const deletedDocumentSchema = z.object({
  id: z.string(),
})
