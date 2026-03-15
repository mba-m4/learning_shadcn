import { api } from "@/api/client"
import { documentsSchema, type Document } from "@/schema/documents"

export const fetchDocuments = async (): Promise<Document[]> => {
  const res = await api.get("/api/documents")
  return documentsSchema.parse(res.data)
}
