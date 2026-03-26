import { Search, X } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { WorkGroup } from '@/types/api'

interface WorksExplorerFiltersProps {
  clearFilters: () => void
  groupFilter: string
  groupName?: string
  groups: WorkGroup[]
  isFilterActive: boolean
  riskStats: {
    avgRisksPerWork: string
    totalRisks: number
    totalWorks: number
  }
  setGroupFilter: (value: string) => void
  setTitleFilter: (value: string) => void
  titleFilter: string
}

export default function WorksExplorerFilters({
  clearFilters,
  groupFilter,
  groupName,
  groups,
  isFilterActive,
  riskStats,
  setGroupFilter,
  setTitleFilter,
  titleFilter,
}: WorksExplorerFiltersProps) {
  return (
    <>
      <Accordion type="single" collapsible>
        <AccordionItem value="filters" className="border-none">
          <AccordionTrigger className="py-2 text-xs text-muted-foreground">
            詳細検索を開く
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>グループ</Label>
                <Select value={groupFilter} onValueChange={setGroupFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="全て" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全て</SelectItem>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={String(group.id)}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>作業名検索</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={titleFilter}
                    onChange={(event) => setTitleFilter(event.target.value)}
                    placeholder="作業タイトル/説明を検索"
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">
                詳細検索は取得済みデータに対して適用されます。
              </p>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                クリア
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {isFilterActive && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {groupFilter !== 'all' && (
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1">
              <span className="text-xs font-medium text-blue-900">
                グループ: {groupName}
              </span>
              <button
                type="button"
                onClick={() => setGroupFilter('all')}
                className="text-blue-600 hover:text-blue-900"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {titleFilter.trim().length > 0 && (
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1">
              <span className="text-xs font-medium text-purple-900">
                検索: {titleFilter}
              </span>
              <button
                type="button"
                onClick={() => setTitleFilter('')}
                className="text-purple-600 hover:text-purple-900"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {isFilterActive && riskStats.totalWorks > 0 && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              総リスク数
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {riskStats.totalRisks}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {riskStats.totalWorks}件の作業
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              作業1件あたり
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {riskStats.avgRisksPerWork}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">平均リスク数</p>
          </div>
        </div>
      )}
    </>
  )
}