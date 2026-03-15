import { useQuery } from "@tanstack/react-query"
import { fetchDocuments } from "@/api/documents"

export const useQueryDocuments = () =>
  useQuery({
    queryKey: ["documents"],
    queryFn: fetchDocuments,
    staleTime: 1000 * 60, // 1分間はキャッシュを新鮮扱い
    gcTime: 1000 * 60 * 5, // 5分間キャッシュを保持（デフォルト）
    refetchOnWindowFocus: false, // タブ復帰時の再フェッチを抑制
  })
