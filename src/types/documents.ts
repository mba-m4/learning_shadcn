import type { z } from "zod"
import {
  deletedDocumentSchema,
  documentInputSchema,
  documentSchema,
} from "@/schema/documents"

export type DocumentSortOrder = "newest" | "oldest" | "title"

export type Document = z.infer<typeof documentSchema>

export type DocumentInput = z.infer<typeof documentInputSchema>

export type DeletedDocument = z.infer<typeof deletedDocumentSchema>

export type FetchDocumentsParams = {
  page?: number
  keyword?: string
  sort?: DocumentSortOrder
}
