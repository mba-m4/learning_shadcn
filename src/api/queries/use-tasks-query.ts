import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Task } from '@/types/task'

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
}

export function useTasksQuery() {
  return useQuery({
    queryKey: taskKeys.lists(),
    queryFn: (): Promise<Task[]> =>
      fetch('/api/tasks').then((res) => {
        if (!res.ok) throw new Error('Failed to fetch tasks')
        return res.json()
      }),
  })
}

export function useTaskQuery(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: (): Promise<Task> =>
      fetch(`/api/tasks/${id}`).then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch task ${id}`)
        return res.json()
      }),
    enabled: !!id,
  })
}

export function useCreateTaskMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (task: Omit<Task, 'id'>): Promise<Task> =>
      fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      }).then((res) => {
        if (!res.ok) throw new Error('Failed to create task')
        return res.json()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, task }: { id: string; task: Partial<Task> }): Promise<Task> =>
      fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      }).then((res) => {
        if (!res.ok) throw new Error(`Failed to update task ${id}`)
        return res.json()
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string): Promise<void> =>
      fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      }).then((res) => {
        if (!res.ok) throw new Error(`Failed to delete task ${id}`)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}
