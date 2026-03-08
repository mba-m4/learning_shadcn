import { queryClient } from '@/lib/query-client'
import { navigationKeys } from '@/api/navigation'
import { pageContentKeys } from '@/api/page-content'
import type { TopNavConfig } from '@/types/navigation'
import type { PageContent } from '@/mocks/data/page-content'

/**
 * Workspace ページのデータをプリロード
 */
export async function workspaceLoader() {
  // ナビゲーション設定とページコンテンツを並列プリロード
  await Promise.all([
    queryClient.ensureQueryData({
      queryKey: navigationKeys.config(),
      queryFn: (): Promise<TopNavConfig[]> =>
        fetch('/api/navigation').then((res) => {
          if (!res.ok) throw new Error('Failed to fetch navigation config')
          return res.json()
        }),
    }),
    queryClient.ensureQueryData({
      queryKey: pageContentKeys.lists(),
      queryFn: (): Promise<Record<string, PageContent>> =>
        fetch('/api/page-content').then((res) => {
          if (!res.ok) throw new Error('Failed to fetch all page content')
          return res.json()
        }),
    }),
  ])

  return null
}
