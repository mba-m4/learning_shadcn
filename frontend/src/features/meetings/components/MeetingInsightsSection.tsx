import { Button } from '@/components/ui/button'
import type { Meeting } from '@/types/api'
import type { MeetingInsightsViewModel } from '@/features/meetings/model/meetingInsights'

interface Props {
  extractedRisks: Meeting['extracted_risks']
  insights: MeetingInsightsViewModel
  onAddRisk(): void
}

export function MeetingInsightsSection({ extractedRisks, insights, onAddRisk }: Props) {
  return (
    <>
      <section className="rounded-xl border border-border/60 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              AI Summary
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">AIサマリー</h2>
          </div>
        </div>
        <div className="mt-4 grid gap-4">
          <div className="rounded-lg border border-border/60 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">要約</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{insights.summary}</p>
          </div>
          <div className="rounded-lg border border-border/60 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">決定事項</p>
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {insights.decisions.map((decision) => (
                <li key={decision}>{decision}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-border/60 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">対応項目</p>
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {insights.actionItems.map((actionItem) => (
                <li key={actionItem}>{actionItem}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border/60 bg-white">
        <div className="border-b border-border/60 px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Extracted Risks
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">抽出リスク</p>
        </div>
        <div className="divide-y">
          {extractedRisks.map((risk) => (
            <div key={risk.id} className="px-6 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{risk.title}</p>
                  <p className="text-xs text-muted-foreground">{risk.summary}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onAddRisk}
                >
                  台帳へ追加
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}