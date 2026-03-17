import { api } from "@/api/client"
import { documentApiPaths } from "@/api/paths"
import {
  deletedDocumentSchema,
  documentInputSchema,
  documentSchema,
  documentsSchema,
} from "@/schema/documents"
import type {
  DeletedDocument,
  Document,
  DocumentInput,
  FetchDocumentsParams,
} from "@/types/documents"

export const fetchDocuments = async (
  params?: FetchDocumentsParams
): Promise<Document[]> => {
  const res = await api.get(documentApiPaths.list, { params })
  return documentsSchema.parse(res.data)
}

export const fetchDocumentById = async (id: string): Promise<Document> => {
  const res = await api.get(documentApiPaths.detail(id))
  return documentSchema.parse(res.data)
}

export const createDocument = async (
  payload: DocumentInput
): Promise<Document> => {
  const res = await api.post(
    documentApiPaths.list,
    documentInputSchema.parse(payload)
  )
  return documentSchema.parse(res.data)
}

export const updateDocument = async (
  id: string,
  payload: DocumentInput
): Promise<Document> => {
  const res = await api.put(
    documentApiPaths.detail(id),
    documentInputSchema.parse(payload)
  )
  return documentSchema.parse(res.data)
}

export const deleteDocument = async (id: string): Promise<DeletedDocument> => {
  const res = await api.delete(documentApiPaths.detail(id))
  return deletedDocumentSchema.parse(res.data)
}
