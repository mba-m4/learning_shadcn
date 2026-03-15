import { http, HttpResponse } from "msw"
import { type Document } from "@/schema/documents"

const mockDocuments: Document[] = [
  {
    id: "1",
    title: "手順書1",
    description: "説明1",
    createdAt: new Date(),
  },
  {
    id: "2",
    title: "手順書2",
    description: "説明2",
    createdAt: new Date(),
  },
]

export const handlers = [
  http.get("/api/documents", () => {
    return HttpResponse.json(mockDocuments)
  }),
]
