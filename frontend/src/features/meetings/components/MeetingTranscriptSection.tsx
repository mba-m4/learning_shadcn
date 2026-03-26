import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export interface TranscriptSegment {
  id: string
  start: number
  end: number
  text: string
}

interface Props {
  transcriptQuery: string
  filteredTranscripts: TranscriptSegment[]
  activeSegmentId?: string
  onTranscriptQueryChange(value: string): void
  onSelectSegment(startTime: number): void
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remaining = Math.floor(seconds % 60)
  return `${minutes}:${String(remaining).padStart(2, '0')}`
}

export function MeetingTranscriptSection({
  transcriptQuery,
  filteredTranscripts,
  activeSegmentId,
  onTranscriptQueryChange,
  onSelectSegment,
}: Props) {
  return (
    <section className="rounded-xl border border-border/60 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Transcript
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">文字起こし</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={transcriptQuery}
              onChange={(event) => onTranscriptQueryChange(event.target.value)}
              placeholder="検索"
              className="pl-9"
            />
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {filteredTranscripts.map((segment) => {
          const isActive = segment.id === activeSegmentId
          return (
            <button
              key={segment.id}
              type="button"
              onClick={() => onSelectSegment(segment.start)}
              className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                isActive
                  ? 'border-blue-200 bg-blue-50/60'
                  : 'border-border/60 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatTime(segment.start)}</span>
              </div>
              <p className="mt-2 text-sm text-slate-800">{segment.text}</p>
            </button>
          )
        })}
      </div>
    </section>
  )
}