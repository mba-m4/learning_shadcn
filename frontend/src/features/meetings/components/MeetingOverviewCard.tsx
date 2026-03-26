import { Button } from '@/components/ui/button'
import type { Meeting } from '@/types/api'

interface Props {
  meeting: Meeting
  syncState: string
  isRefreshing: boolean
  onRefresh(): void
}

export function MeetingOverviewCard({
  meeting,
  syncState,
  isRefreshing,
  onRefresh,
}: Props) {
  return (
    <section className="rounded-xl border border-border/60 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Meeting
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">{meeting.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{meeting.date}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {meeting.participants.map((name) => (
              <span
                key={name}
                className="rounded-full border border-border/60 px-2 py-0.5 text-xs text-muted-foreground"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            抽出を再実行
          </Button>
          <span className="text-xs text-muted-foreground">状態: {syncState}</span>
        </div>
      </div>
    </section>
  )
}