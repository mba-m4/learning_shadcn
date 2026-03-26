import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface WorksExplorerToolbarProps {
  filteredCount: number
  isFilterActive: boolean
  listEndDate: string
  listLimit: number
  listStartDate: string
  onLimitChange: (value: string) => void
  onRefetch: () => void
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
  rangeEnd: number
  rangeLabel: string
  rangeStart: number
  workListTotal: number
}

export default function WorksExplorerToolbar({
  filteredCount,
  isFilterActive,
  listEndDate,
  listLimit,
  listStartDate,
  onEndDateChange,
  onLimitChange,
  onRefetch,
  onStartDateChange,
  rangeEnd,
  rangeLabel,
  rangeStart,
  workListTotal,
}: WorksExplorerToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-6 py-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Explorer
        </p>
        <p className="mt-2 text-base font-semibold text-slate-900">作業一覧</p>
        <p className="text-xs text-muted-foreground">
          {workListTotal} 件中 {rangeStart} - {rangeEnd} 件
        </p>
        <p className="text-xs text-muted-foreground">{rangeLabel}</p>
        {isFilterActive && (
          <p className="text-xs text-muted-foreground">
            フィルター後: {filteredCount} 件
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
          <Input
            type="date"
            value={listStartDate}
            onChange={(event) => onStartDateChange(event.target.value)}
            className="h-9 w-full md:w-[180px]"
          />
          <span className="hidden text-xs text-muted-foreground md:inline">〜</span>
          <Input
            type="date"
            value={listEndDate}
            onChange={(event) => onEndDateChange(event.target.value)}
            className="h-9 w-full md:w-[180px]"
          />
        </div>
        <Input
          type="number"
          min={10}
          max={100}
          value={listLimit}
          onChange={(event) => onLimitChange(event.target.value)}
          className="w-[90px]"
        />
        <Button size="sm" variant="outline" onClick={onRefetch}>
          再読み込み
        </Button>
      </div>
    </div>
  )
}