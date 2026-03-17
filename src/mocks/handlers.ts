import { http, HttpResponse } from "msw"
import { documentMockPaths } from "@/api/paths"
import { documentInputSchema } from "@/schema/documents"
import type {
  Document,
  DocumentInput,
  FetchDocumentsParams,
} from "@/types/documents"

let mockDocuments: Document[] = [
  {
    id: "1",
    title: "運用手順テンプレート",
    description: "毎朝の監視確認で見るポイントをまとめたサンプルです。",
    createdAt: new Date("2026-03-10T09:00:00.000Z"),
  },
  {
    id: "2",
    title: "オンボーディングガイド",
    description: "新しく参加したメンバー向けの手順書です。",
    createdAt: new Date("2026-03-12T11:30:00.000Z"),
  },
  {
    id: "3",
    title: "障害対応メモ",
    description: "一次切り分けとエスカレーション条件のテンプレートです。",
    createdAt: new Date("2026-03-15T08:15:00.000Z"),
  },
]

const sortDocuments = (
  documents: Document[],
  sort: FetchDocumentsParams["sort"] = "newest"
) => {
  const nextDocuments = [...documents]

  if (sort === "title") {
    return nextDocuments.sort((left, right) =>
      left.title.localeCompare(right.title, "ja")
    )
  }

  return nextDocuments.sort((left, right) => {
    const delta = left.createdAt.getTime() - right.createdAt.getTime()
    return sort === "oldest" ? delta : -delta
  })
}

const filterDocuments = (documents: Document[], keyword: string | null) => {
  if (!keyword) {
    return documents
  }

  const normalizedKeyword = keyword.trim().toLowerCase()

  if (!normalizedKeyword) {
    return documents
  }

  return documents.filter((document) => {
    const title = document.title.toLowerCase()
    const description = document.description.toLowerCase()

    return (
      title.includes(normalizedKeyword) ||
      description.includes(normalizedKeyword)
    )
  })
}

const buildDocument = (payload: DocumentInput): Document => ({
  id: String(Date.now()),
  createdAt: new Date(),
  ...payload,
})

export const handlers = [
  http.get(documentMockPaths.list, ({ request }) => {
    const url = new URL(request.url)
    const keyword = url.searchParams.get("keyword")
    const sort = (url.searchParams.get("sort") ??
      "newest") as FetchDocumentsParams["sort"]

    return HttpResponse.json(
      sortDocuments(filterDocuments(mockDocuments, keyword), sort)
    )
  }),
  http.get(documentMockPaths.detail, ({ params }) => {
    const document = mockDocuments.find((item) => item.id === params.id)

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

    const nextDocument = buildDocument(parsed.data)
    mockDocuments = [nextDocument, ...mockDocuments]

    return HttpResponse.json(nextDocument, { status: 201 })
  }),
  http.put(documentMockPaths.detail, async ({ params, request }) => {
    const body = await request.json()
    const parsed = documentInputSchema.safeParse(body)
    const targetIndex = mockDocuments.findIndex((item) => item.id === params.id)

    if (targetIndex < 0) {
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

    const currentDocument = mockDocuments[targetIndex]
    const updatedDocument: Document = {
      ...currentDocument,
      ...parsed.data,
    }

    mockDocuments = mockDocuments.map((item) =>
      item.id === updatedDocument.id ? updatedDocument : item
    )

    return HttpResponse.json(updatedDocument)
  }),
  http.delete(documentMockPaths.detail, ({ params }) => {
    const target = mockDocuments.find((item) => item.id === params.id)

    if (!target) {
      return HttpResponse.json(
        { message: "Document not found" },
        { status: 404 }
      )
    }

    mockDocuments = mockDocuments.filter((item) => item.id !== params.id)

    return HttpResponse.json({ id: target.id })
  }),
]
