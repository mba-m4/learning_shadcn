import { useQuery } from '@tanstack/react-query'
import type { TopNavConfig } from '@/types/navigation'

export const navigationKeys = {
  all: ['navigation'] as const,
  config: () => [...navigationKeys.all, 'config'] as const,
}

export function useNavigationQuery() {
  return useQuery({
    queryKey: navigationKeys.config(),
    queryFn: (): Promise<TopNavConfig[]> =>
      fetch('/api/navigation').then((res) => {
        if (!res.ok) throw new Error('Failed to fetch navigation config')
        return res.json()
      }),
    staleTime: Infinity, // ナビゲーション構成は静的なので無期限キャッシュ
  })
}
