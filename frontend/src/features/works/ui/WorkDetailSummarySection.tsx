import { Button } from '@/components/ui/button'
import type { Incident, Manual } from '@/types/api'
import type { RelatedRiskPreview } from '@/features/works/model/useWorkDetailController'

interface WorkDetailSummarySectionProps {
  onOpenManuals: () => void
  relatedIncidents: Incident[]
  relatedManuals: Manual[]
  relatedRisks: {
    total: number
    items: RelatedRiskPreview[]
  }
}

export default function WorkDetailSummarySection({
  onOpenManuals,
  relatedIncidents,
  relatedManuals,
  relatedRisks,
}: WorkDetailSummarySectionProps) {
  return (
    <section className="rounded-xl border border-border/60 bg-white px-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Related Summary
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">関連サマリー</h2>
        </div>
        <Button size="sm" variant="outline" onClick={onOpenManuals}>
          手順書を見る
        </Button>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border/60 bg-slate-50/40 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">関連リスク</p>
            <span className="rounded-full border border-border/60 px-2 py-0.5 text-xs text-muted-foreground">
              {relatedRisks.total} 件
            </span>
          </div>
          {relatedRisks.items.length === 0 ? (
            <p className="mt-3 text-xs text-muted-foreground">関連リスクはありません</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {relatedRisks.items.map((risk) => (
                <li key={risk.id} className="text-xs text-slate-700">
                  <span className="mr-2 rounded-full border border-border/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {risk.source}
                  </span>
                  {risk.content}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-lg border border-border/60 bg-slate-50/40 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">関連インシデント</p>
            <span className="rounded-full border border-border/60 px-2 py-0.5 text-xs text-muted-foreground">
              {relatedIncidents.length} 件
            </span>
          </div>
          {relatedIncidents.length === 0 ? (
            <p className="mt-3 text-xs text-muted-foreground">関連インシデントはありません</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {relatedIncidents.slice(0, 3).map((incident) => (
                <li key={incident.id} className="text-xs text-slate-700">
                  {incident.title}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-lg border border-border/60 bg-slate-50/40 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">関連マニュアル</p>
            <span className="rounded-full border border-border/60 px-2 py-0.5 text-xs text-muted-foreground">
              {relatedManuals.length} 件
            </span>
          </div>
          {relatedManuals.length === 0 ? (
            <p className="mt-3 text-xs text-muted-foreground">関連マニュアルはありません</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {relatedManuals.map((manual) => (
                <li key={manual.id} className="text-xs text-slate-700">
                  {manual.title}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-[11px] text-muted-foreground">最近更新の手順書を表示</p>
        </div>
      </div>
    </section>
  )
}