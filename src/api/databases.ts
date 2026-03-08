import { useQuery } from '@tanstack/react-query'
import type { DbTable } from '@/types/template'

export const databaseKeys = {
  all: ['databases'] as const,
  lists: () => [...databaseKeys.all, 'list'] as const,
  details: () => [...databaseKeys.all, 'detail'] as const,
  detail: (tableName: string) => [...databaseKeys.details(), tableName] as const,
}

export function useDatabaseTablesQuery() {
  return useQuery({
    queryKey: databaseKeys.lists(),
    queryFn: (): Promise<DbTable[]> =>
      fetch('/api/databases/tables').then((res) => {
        if (!res.ok) throw new Error('Failed to fetch database tables')
        return res.json()
      }),
    staleTime: 1000 * 60 * 10, // 10分キャッシュ
  })
}

export function useDatabaseTableQuery(tableName: string) {
  return useQuery({
    queryKey: databaseKeys.detail(tableName),
    queryFn: (): Promise<DbTable> =>
      fetch(`/api/databases/tables/${encodeURIComponent(tableName)}`).then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch table ${tableName}`)
        return res.json()
      }),
    enabled: !!tableName,
  })
}
