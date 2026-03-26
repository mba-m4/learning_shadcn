import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import PageHeader from '@/components/layout/PageHeader'
import { useManualStore } from '@/stores/manualStore'

export default function ManualsPage() {
  const [query, setQuery] = useState('')
  const { manuals, fetchManuals } = useManualStore()

  useEffect(() => {
    void fetchManuals()
  }, [fetchManuals])

  const filtered = manuals.filter((manual) =>
    manual.title.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="space-y-8">
      <PageHeader
        title="Manuals"
        subtitle="手順書とナレッジを検索します。"
      />
      <div className="rounded-xl border border-border/60 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-6 py-4">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Knowledge Base
          </div>
          <div className="w-full max-w-xs">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="手順書を検索"
                className="pl-9"
              />
            </div>
          </div>
        </div>
        <div className="divide-y">
          {filtered.map((manual) => (
            <div key={manual.id} className="px-6 py-4">
              <p className="text-sm font-semibold text-slate-900">{manual.title}</p>
              <p className="text-xs text-muted-foreground">{manual.category}</p>
              <p className="mt-2 text-sm text-muted-foreground">{manual.summary}</p>
            </div>
          ))}
        </div>
      </div>
      <section className="rounded-xl border border-border/60 bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          AI Q&A
        </p>
        <p className="mt-2 text-lg font-semibold text-slate-900">AI質問応答</p>
        <p className="mt-2 text-sm text-muted-foreground">
          ここにAI回答が表示されます。
        </p>
      </section>
    </div>
  )
}
