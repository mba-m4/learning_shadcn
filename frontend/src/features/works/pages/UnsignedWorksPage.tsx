import { useCallback, useState } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, Search } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import { Input } from '@/components/ui/input'
import {
  createWorkAcknowledgmentQueryOptions,
  createWorkDailyOverviewQueryOptions,
} from '@/features/works/api/queries'
import type { WorkOverview } from '@/types/api'

export default function UnsignedWorksPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const date = new Date().toISOString().slice(0, 10)
  const selectFilteredOverview = useCallback(
    (dailyOverview: WorkOverview[]) => {
      if (!query.trim()) {
        return dailyOverview
      }

      const normalizedQuery = query.toLowerCase()
      return dailyOverview.filter(
        (overview) =>
          overview.work.title.toLowerCase().includes(normalizedQuery) ||
          overview.work.description.toLowerCase().includes(normalizedQuery),
      )
    },
    [query],
  )
  const dailyOverviewQuery = useQuery(
    createWorkDailyOverviewQueryOptions(date, {
      select: selectFilteredOverview,
    }),
  )
  const dailyOverview = dailyOverviewQuery.data ?? []
  const acknowledgmentQueries = useQueries({
    queries: dailyOverview.map((overview) => ({
      ...createWorkAcknowledgmentQueryOptions(overview.work.id),
      retry: false,
    })),
  })
  const acknowledgments = dailyOverview.reduce<Record<number, boolean>>((accumulator, overview, index) => {
    accumulator[overview.work.id] = Boolean(acknowledgmentQueries[index]?.data)
    return accumulator
  }, {})

  const unsignedWorks = dailyOverview.filter((overview) => !acknowledgments[overview.work.id])

  return (
    <div className="space-y-8">
      <PageHeader
        title="Unsigned Works"
        subtitle="署名が必要な作業を一覧表示します。"
      />
      {dailyOverviewQuery.error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          作業一覧の取得に失敗しました。
        </div>
      )}
      
      <div className="rounded-xl border border-border/60 bg-white p-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          <ClipboardList className="h-4 w-4" />
          Summary
        </div>
        <p className="mt-3 text-2xl font-semibold text-slate-900">{unsignedWorks.length}</p>
        <p className="text-sm text-muted-foreground">署名前の作業数</p>
      </div>

      <div className="rounded-xl border border-border/60 bg-white">
        <div className="border-b border-border/60 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                Unsigned Works List
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">署名前の作業一覧</h2>
            </div>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="作業を検索..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="divide-y">
          {unsignedWorks.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                {query
                  ? '検索条件に一致する作業はありません'
                  : '署名が必要な作業はありません'}
              </p>
            </div>
          ) : (
            unsignedWorks.map((overview) => (
              <button
                key={overview.work.id}
                type="button"
                onClick={() => navigate(`/works/${overview.work.id}`)}
                className="flex w-full flex-wrap items-center justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-slate-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {overview.work.title}
                    </p>
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                      未署名
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {overview.work.description}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>作業項目: {overview.items.length}</span>
                    <span>
                      リスク:{' '}
                      {overview.items.reduce((sum, item) => sum + item.risks.length, 0)}
                    </span>
                    <span>作業日: {overview.work.work_date}</span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
