import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCounterStore } from '@/stores/counter-store'
import type { Task } from '@/types/task'

export function HomePage() {
  const count = useCounterStore((state) => state.count)
  const increment = useCounterStore((state) => state.increment)
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    const load = async () => {
      const response = await fetch('/api/tasks')
      const data = (await response.json()) as Task[]
      setTasks(data)
    }

    load()
  }, [])

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-3xl flex-col gap-6 p-6">
      <section className="rounded-xl border p-4">
        <h1 className="mb-3 text-xl font-semibold">初期セットアップ確認</h1>
        <p className="mb-4 text-sm text-muted-foreground">
          react-router / Zustand / shadcn/ui / MSW が有効な最小構成です。
        </p>
        <div className="flex items-center gap-3">
          <Button onClick={increment}>count: {count}</Button>
          <span className="text-sm text-muted-foreground">Zustand state</span>
        </div>
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="mb-3 text-lg font-medium">MSW tasks</h2>
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={task.id} className="rounded-md border px-3 py-2 text-sm">
              {task.done ? '✅' : '⬜️'} {task.title}
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
