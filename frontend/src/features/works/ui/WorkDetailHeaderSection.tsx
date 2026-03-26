import { Button } from '@/components/ui/button'
import WorkItemList from '@/features/works/ui/WorkItemList'
import type { WorkOverview } from '@/types/api'

interface WorkDetailHeaderSectionProps {
  detail: WorkOverview
  onBack: () => void
  onOpenExplorer: () => void
}

const statusLabel: Record<'draft' | 'confirmed', string> = {
  draft: '下書き',
  confirmed: '確定',
}

const statusTone: Record<'draft' | 'confirmed', string> = {
  draft: 'text-amber-700 bg-amber-50',
  confirmed: 'text-emerald-700 bg-emerald-50',
}

export default function WorkDetailHeaderSection({
  detail,
  onBack,
  onOpenExplorer,
}: WorkDetailHeaderSectionProps) {
  return (
    <section className="rounded-xl border border-border/60 bg-white px-6 py-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Work Detail
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            {detail.work.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {detail.work.description}
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`rounded-full px-2 py-0.5 font-semibold ${statusTone[detail.work.status]}`}>
              {statusLabel[detail.work.status]}
            </span>
            <span className="rounded-full border border-border/60 px-2 py-0.5 text-muted-foreground">
              作業日: {detail.work.work_date}
            </span>
            <span className="rounded-full border border-border/60 px-2 py-0.5 text-muted-foreground">
              グループ: {detail.work.group_id}
            </span>
            <span className="rounded-full border border-border/60 px-2 py-0.5 text-muted-foreground">
              作業ID: {detail.work.id}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={onOpenExplorer}>
              全件ビューへ
            </Button>
            <Button size="sm" onClick={onBack}>
              戻る
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <WorkItemList items={detail.items} />
      </div>
    </section>
  )
}