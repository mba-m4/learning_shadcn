import { Button } from '@/components/ui/button'
import type { Incident } from '@/types/api'

interface WorkDetailIncidentsSectionProps {
  incidents: Incident[]
  onCreate: () => void
  onOpenIncident: (incidentId: number) => void
}

export default function WorkDetailIncidentsSection({
  incidents,
  onCreate,
  onOpenIncident,
}: WorkDetailIncidentsSectionProps) {
  return (
    <section className="rounded-xl border border-border/60 bg-white">
      <div className="border-b border-border/60 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Related Incidents
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              関連インシデント・ヒヤリハット
            </h2>
          </div>
          <Button size="sm" onClick={onCreate}>
            追加
          </Button>
        </div>
      </div>
      {incidents.length === 0 ? (
        <div className="px-6 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            関連するインシデント・ヒヤリハットはありません
          </p>
        </div>
      ) : (
        <div className="divide-y">
          {incidents.map((incident) => (
            <button
              key={incident.id}
              type="button"
              onClick={() => onOpenIncident(incident.id)}
              className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-slate-50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">{incident.title}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      incident.type === 'incident'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {incident.type === 'incident' ? 'インシデント' : 'ヒヤリハット'}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      incident.status === 'resolved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-50 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {incident.status === 'resolved' ? '解決済' : '対応中'}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{incident.date}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}