import { useQuery } from '@tanstack/react-query'
import type { PageContent } from '@/mocks/data/page-content'

export const pageContentKeys = {
  all: ['page-content'] as const,
  lists: () => [...pageContentKeys.all, 'list'] as const,
  details: () => [...pageContentKeys.all, 'detail'] as const,
  detail: (path: string) => [...pageContentKeys.details(), path] as const,
}

export function usePageContentQuery(path: string) {
  return useQuery({
    queryKey: pageContentKeys.detail(path),
    queryFn: (): Promise<PageContent> =>
      fetch(`/api/page-content/${encodeURIComponent(path)}`).then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch page content for ${path}`)
        return res.json()
      }),
    enabled: !!path,
  })
}

export function useAllPageContentQuery() {
  return useQuery({
    queryKey: pageContentKeys.lists(),
    queryFn: (): Promise<Record<string, PageContent>> =>
      fetch('/api/page-content').then((res) => {
        if (!res.ok) throw new Error('Failed to fetch all page content')
        return res.json()
      }),
    staleTime: 1000 * 60 * 10, // 10分キャッシュ
  })
}
