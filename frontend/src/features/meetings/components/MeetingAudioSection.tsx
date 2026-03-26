import { Bookmark, Mic2, Pause, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface BookmarkItem {
  id: string
  time: number
  note: string
}

interface Props {
  currentTime: number
  duration: number
  isPlaying: boolean
  bookmarkNote: string
  bookmarks: BookmarkItem[]
  onTogglePlay(): void
  onTimeChange(value: number): void
  onBookmarkNoteChange(value: string): void
  onAddBookmark(): void
  onSelectBookmark(time: number): void
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remaining = Math.floor(seconds % 60)
  return `${minutes}:${String(remaining).padStart(2, '0')}`
}

export function MeetingAudioSection({
  currentTime,
  duration,
  isPlaying,
  bookmarkNote,
  bookmarks,
  onTogglePlay,
  onTimeChange,
  onBookmarkNoteChange,
  onAddBookmark,
  onSelectBookmark,
}: Props) {
  return (
    <section className="rounded-xl border border-border/60 bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Audio Player
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">音声プレイヤー</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Mic2 className="h-4 w-4" />
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <Button
          size="sm"
          variant={isPlaying ? 'secondary' : 'default'}
          onClick={onTogglePlay}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <input
          type="range"
          min={0}
          max={duration}
          value={currentTime}
          onChange={(event) => onTimeChange(Number(event.target.value))}
          className="w-full"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={onAddBookmark}
        >
          <Bookmark className="mr-2 h-4 w-4" />
          ブックマーク
        </Button>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Input
          value={bookmarkNote}
          onChange={(event) => onBookmarkNoteChange(event.target.value)}
          placeholder="ブックマークのメモ"
        />
      </div>
      {bookmarks.length > 0 && (
        <div className="mt-4 grid gap-2">
          {bookmarks.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectBookmark(item.time)}
              className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
            >
              <span>{item.note}</span>
              <span className="text-muted-foreground">{formatTime(item.time)}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}