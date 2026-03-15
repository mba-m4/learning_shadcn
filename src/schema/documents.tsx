import { z } from "zod"

export const documentSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  createdAt: z.coerce.date(),
})

export const documentsSchema = z.array(documentSchema)

export type Document = z.infer<typeof documentSchema>
