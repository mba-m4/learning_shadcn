import { http, HttpResponse } from "msw"
import { documentMockPaths, projectMockPaths } from "@/api/paths"
import {
  createDocumentRecord,
  deleteDocumentRecord,
  findDocumentById,
  findProjectById,
  listDocuments,
  listProjects,
  updateDocumentRecord,
} from "@/mocks/appDb"
import { documentInputSchema } from "@/schema/documents"
import type { FetchDocumentsParams } from "@/types/documents"

export const handlers = [
  http.get(documentMockPaths.list, ({ request }) => {
    const url = new URL(request.url)
    const keyword = url.searchParams.get("keyword")
    const projectId = url.searchParams.get("projectId") ?? undefined
    const sort = (url.searchParams.get("sort") ??
      "newest") as FetchDocumentsParams["sort"]

    return HttpResponse.json(listDocuments({ keyword, projectId, sort }))
  }),
  http.get(documentMockPaths.detail, ({ params }) => {
    const document = findDocumentById(String(params.id))

    if (!document) {
      return HttpResponse.json(
        { message: "Document not found" },
        { status: 404 }
      )
    }

    return HttpResponse.json(document)
  }),
  http.post(documentMockPaths.list, async ({ request }) => {
    const body = await request.json()
    const parsed = documentInputSchema.safeParse(body)

    if (!parsed.success) {
      return HttpResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 }
      )
    }

    const nextDocument = createDocumentRecord(parsed.data)

    if (!nextDocument) {
      return HttpResponse.json(
        { message: "Project not found" },
        { status: 400 }
      )
    }

    return HttpResponse.json(nextDocument, { status: 201 })
  }),
  http.put(documentMockPaths.detail, async ({ params, request }) => {
    const body = await request.json()
    const parsed = documentInputSchema.safeParse(body)
    const documentId = String(params.id)
    const currentDocument = findDocumentById(documentId)

    if (!currentDocument) {
      return HttpResponse.json(
        { message: "Document not found" },
        { status: 404 }
      )
    }

    if (!parsed.success) {
      return HttpResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 }
      )
    }

    const updatedDocument = updateDocumentRecord(documentId, parsed.data)

    if (!updatedDocument) {
      return HttpResponse.json(
        { message: "Project not found" },
        { status: 400 }
      )
    }

    return HttpResponse.json(updatedDocument)
  }),
  http.delete(documentMockPaths.detail, ({ params }) => {
    const target = deleteDocumentRecord(String(params.id))

    if (!target) {
      return HttpResponse.json(
        { message: "Document not found" },
        { status: 404 }
      )
    }

    return HttpResponse.json({ id: target.id })
  }),
  http.get(projectMockPaths.list, () => HttpResponse.json(listProjects())),
  http.get(projectMockPaths.detail, ({ params }) => {
    const project = findProjectById(String(params.id))

    if (!project) {
      return HttpResponse.json(
        { message: "Project not found" },
        { status: 404 }
      )
    }

    return HttpResponse.json(project)
  }),
]
