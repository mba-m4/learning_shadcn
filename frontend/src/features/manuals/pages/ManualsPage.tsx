import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import PageHeader from '@/components/layout/PageHeader'
import { createManualsQueryOptions } from '@/features/manuals/api/queries'
import { getErrorMessage } from '@/shared/api/client'

export default function ManualsPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const manualsQuery = useQuery(createManualsQueryOptions())
  const manuals = manualsQuery.data ?? []

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
          {manualsQuery.error && (
            <div className="px-6 py-4 text-sm text-destructive">
              {getErrorMessage(manualsQuery.error)}
            </div>
          )}
          {manualsQuery.isLoading && (
            <div className="px-6 py-4 text-sm text-muted-foreground">読み込み中...</div>
          )}
          {!manualsQuery.isLoading && filtered.length === 0 && (
            <div className="px-6 py-4 text-sm text-muted-foreground">該当する手順書はありません。</div>
          )}
          {filtered.map((manual) => (
            <button
              key={manual.id}
              type="button"
              onClick={() => navigate(`/manuals/${manual.id}`)}
              className="w-full px-6 py-4 text-left transition-colors hover:bg-slate-50"
            >
              <p className="text-sm font-semibold text-slate-900">{manual.title}</p>
              <p className="text-xs text-muted-foreground">{manual.category}</p>
              <p className="mt-2 text-sm text-muted-foreground">{manual.summary}</p>
            </button>
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
