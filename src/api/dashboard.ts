import { queryClient } from '@/lib/query-client'
import { taskKeys } from '@/api/tasks'
import type { Task } from '@/types/task'

/**
 * Dashboard overview ページのデータをプリロード
 */
export async function dashboardOverviewLoader() {
  // TanStack Query でタスクデータをプリロード
  await queryClient.ensureQueryData({
    queryKey: taskKeys.lists(),
    queryFn: (): Promise<Task[]> =>
      fetch('/api/tasks').then((res) => {
        if (!res.ok) throw new Error('Failed to fetch tasks')
        return res.json()
      }),
  })

  return null
}
