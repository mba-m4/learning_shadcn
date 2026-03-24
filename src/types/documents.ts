import type { z } from "zod"
import {
  deletedDocumentSchema,
  documentCategorySchema,
  documentCategoryValues,
  documentInputSchema,
  documentSchema,
  documentStatusSchema,
  documentStatusValues,
} from "@/schema/documents"
import type { ProjectSummary } from "@/types/projects"

export type DocumentSortOrder = "newest" | "oldest" | "title"

export type DocumentCategory = z.infer<typeof documentCategorySchema>

export type DocumentStatus = z.infer<typeof documentStatusSchema>

export type Document = z.infer<typeof documentSchema>

export type DocumentInput = z.infer<typeof documentInputSchema>

export type DeletedDocument = z.infer<typeof deletedDocumentSchema>

export type FetchDocumentsParams = {
  page?: number
  keyword?: string
  projectId?: string
  sort?: DocumentSortOrder
}

export type DocumentProject = ProjectSummary

export const documentCategoryLabels = {
  runbook: "Runbook",
  guide: "Guide",
  incident: "Incident",
  release: "Release",
  memo: "Memo",
} satisfies Record<DocumentCategory, string>

export const documentStatusLabels = {
  draft: "Draft",
  review: "Review",
  published: "Published",
  archived: "Archived",
} satisfies Record<DocumentStatus, string>

export const documentCategoryOptions: ReadonlyArray<{
  value: DocumentCategory
  label: string
}> = documentCategoryValues.map((value) => ({
  value,
  label: documentCategoryLabels[value],
}))

export const documentStatusOptions: ReadonlyArray<{
  value: DocumentStatus
  label: string
}> = documentStatusValues.map((value) => ({
  value,
  label: documentStatusLabels[value],
}))
