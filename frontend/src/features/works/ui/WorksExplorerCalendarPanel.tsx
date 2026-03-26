import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'

interface WorksExplorerCalendarPanelProps {
  hasWorkDates: Set<string>
  loading: boolean
  month: Date
  onDaySelect: (date?: Date) => void
  onMonthChange: (date: Date) => void
  onResetRange: () => void
  onClose?: () => void
  selectedDate?: Date
}

const formatDate = (date: Date) => format(date, 'yyyy-MM-dd')

export default function WorksExplorerCalendarPanel({
  hasWorkDates,
  loading,
  month,
  onClose,
  onDaySelect,
  onMonthChange,
  onResetRange,
  selectedDate,
}: WorksExplorerCalendarPanelProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-white px-5 py-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Calendar
        </p>
        {onClose ? (
          <Button size="sm" variant="ghost" onClick={onClose}>
            閉じる
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">
            {loading ? '更新中' : '作業あり日を表示'}
          </span>
        )}
      </div>
      <p className="mt-2 text-base font-semibold text-slate-900">作業日カレンダー</p>
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onDaySelect}
        month={month}
        onMonthChange={onMonthChange}
        className="mt-3 w-full rounded-xl border border-border/60 bg-white p-2"
        modifiers={{
          hasWork: (date) => hasWorkDates.has(formatDate(date)),
        }}
        modifiersClassNames={{
          hasWork: 'bg-amber-100 text-amber-900 font-semibold',
        }}
      />
      <div className="mt-3 flex items-center justify-between gap-2">
        <Button size="sm" variant="outline" onClick={onResetRange}>
          月表示に戻す
        </Button>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex h-3 w-3 rounded-sm bg-amber-100" />
        作業がある日
      </div>
    </div>
  )
}