import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Bookmark,
  Brain,
  ChevronRight,
  FileText,
  Link2,
  Mic2,
  Pause,
  Play,
  Search,
  Sparkles,
  Tag,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import PageHeader from '@/components/layout/PageHeader'
import { useMeetingStore } from '@/stores/meetingStore'
import { useWorkStore } from '@/stores/workStore'

type TranscriptSegment = {
  id: string
  start: number
  end: number
  text: string
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remaining = Math.floor(seconds % 60)
  return `${minutes}:${String(remaining).padStart(2, '0')}`
}

export default function MeetingDetailPage() {
  const { meetingId } = useParams()
  const meetingIdNumber = Number(meetingId)
  const navigate = useNavigate()
  const {
    meetings,
    fetchMeeting,
    updateSyncState,
    uploadsByKey,
    fetchUploads,
    addUploads,
  } = useMeetingStore()
  const { workList, fetchWorkList } = useWorkStore()
  const meeting = useMemo(
    () => meetings.find((item) => item.id === meetingIdNumber),
    [meetingIdNumber, meetings],
  )
  const syncState = meeting?.sync_state ?? '待機中'

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(120)
  const duration = 960
  const [bookmarkNote, setBookmarkNote] = useState('')
  const [bookmarks, setBookmarks] = useState<Array<{ id: string; time: number; note: string }>>([])

  const [transcriptQuery, setTranscriptQuery] = useState('')
  const [agendaInput, setAgendaInput] = useState('')
  const [agendaTags, setAgendaTags] = useState<string[]>(['安全', '設備', '保全'])

  const [relatedWorkIds, setRelatedWorkIds] = useState<number[]>([])
  const [selectedWorkId, setSelectedWorkId] = useState<number | ''>('')
  const [materialLink, setMaterialLink] = useState('')
  const [materialLinks, setMaterialLinks] = useState<string[]>([
    'https://example.com/meeting-template.pdf',
  ])

  useEffect(() => {
    if (Number.isNaN(meetingIdNumber)) {
      return
    }
    void fetchMeeting(meetingIdNumber)
    void fetchUploads(meetingIdNumber)
    void fetchWorkList()
  }, [fetchMeeting, meetingIdNumber, fetchUploads, fetchWorkList])

  useEffect(() => {
    if (!isPlaying) {
      return
    }
    const timer = window.setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= duration) {
          setIsPlaying(false)
          return duration
        }
        return prev + 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [duration, isPlaying])

  const transcripts: TranscriptSegment[] = useMemo(
    () => [
      {
        id: 't1',
        start: 0,
        end: 45,
        text: '先週の安全巡視で高温配管エリアの劣化が指摘されています。',
      },
      {
        id: 't2',
        start: 46,
        end: 110,
        text: '補修完了まで立入制限を徹底し、掲示を増やす方針で進めます。',
      },
      {
        id: 't3',
        start: 111,
        end: 180,
        text: '転倒事故の再発防止として、清掃頻度の見直しも必要です。',
      },
      {
        id: 't4',
        start: 181,
        end: 250,
        text: '対策は保全チームと連携して来週までに計画を提出します。',
      },
    ],
    [meetingIdNumber],
  )

  const filteredTranscripts = useMemo(() => {
    return transcripts.filter((segment) => {
      if (transcriptQuery.trim().length === 0) {
        return true
      }
      return segment.text.toLowerCase().includes(transcriptQuery.trim().toLowerCase())
    })
  }, [transcriptQuery, transcripts])

  const activeSegmentId = useMemo(() => {
    return transcripts.find((segment) => currentTime >= segment.start && currentTime <= segment.end)?.id
  }, [currentTime, transcripts])

  const uploads = uploadsByKey[String(meetingIdNumber)] ?? []

  const aiCandidates = useMemo(() => {
    return workList.slice(0, 3).map((item, index) => ({
      ...item,
      score: [0.92, 0.84, 0.76][index] ?? 0.7,
    }))
  }, [workList])

  const relatedWorks = useMemo(() => {
    return workList.filter((item) => relatedWorkIds.includes(item.work.id))
  }, [relatedWorkIds, workList])

  if (!meeting) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">会議が見つかりません。</p>
        <Button variant="outline" onClick={() => navigate('/meetings')}>
          一覧へ戻る
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Meeting Detail"
        subtitle="文字起こし・AI分析・関連付けをまとめて管理します。"
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/meetings')}>
            一覧へ戻る
          </Button>
        }
      />

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
              onClick={() => {
                if (!Number.isNaN(meetingIdNumber)) {
                  updateSyncState(meetingIdNumber, '抽出更新中...').then((result) => {
                    if (result) {
                      toast.success('抽出を再実行しました。')
                    } else {
                      toast.error('抽出の再実行に失敗しました。')
                    }
                  })
                }
              }}
            >
              抽出を再実行
            </Button>
            <span className="text-xs text-muted-foreground">状態: {syncState}</span>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
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
                onClick={() => setIsPlaying((prev) => !prev)}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <input
                type="range"
                min={0}
                max={duration}
                value={currentTime}
                onChange={(event) => setCurrentTime(Number(event.target.value))}
                className="w-full"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (!bookmarkNote.trim()) {
                    toast.info('メモを入力してください。')
                    return
                  }
                  setBookmarks((prev) => [
                    ...prev,
                    { id: String(Date.now()), time: currentTime, note: bookmarkNote.trim() },
                  ])
                  setBookmarkNote('')
                }}
              >
                <Bookmark className="mr-2 h-4 w-4" />
                ブックマーク
              </Button>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <Input
                value={bookmarkNote}
                onChange={(event) => setBookmarkNote(event.target.value)}
                placeholder="ブックマークのメモ"
              />
            </div>
            {bookmarks.length > 0 && (
              <div className="mt-4 grid gap-2">
                {bookmarks.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCurrentTime(item.time)}
                    className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <span>{item.note}</span>
                    <span className="text-muted-foreground">{formatTime(item.time)}</span>
                  </button>
                ))}
              </div>
            )}
          </section>

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
                    onChange={(event) => setTranscriptQuery(event.target.value)}
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
                    onClick={() => setCurrentTime(segment.start)}
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
                <p className="mt-2 text-sm text-muted-foreground">
                  高温配管エリアの劣化指摘により立入制限の強化を決定。清掃頻度見直しと保全計画の提出を優先。
                </p>
              </div>
              <div className="rounded-lg border border-border/60 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">決定事項</p>
                </div>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  <li>高温配管エリアは補修完了まで立入制限</li>
                  <li>掲示物を増やし周知を徹底</li>
                </ul>
              </div>
              <div className="rounded-lg border border-border/60 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">ToDo</p>
                </div>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  <li>保全チームが来週までに対策計画提出</li>
                  <li>清掃頻度の見直しを提案</li>
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
              {meeting.extracted_risks.map((risk) => (
                <div key={risk.id} className="px-6 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{risk.title}</p>
                      <p className="text-xs text-muted-foreground">{risk.summary}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast.success('リスク台帳に追加しました。')}
                    >
                      台帳へ追加
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-border/60 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                  Agenda
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">議題タグ</h2>
              </div>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {agendaTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {tag}
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-slate-900"
                    onClick={() => setAgendaTags((prev) => prev.filter((item) => item !== tag))}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Input
                value={agendaInput}
                onChange={(event) => setAgendaInput(event.target.value)}
                placeholder="議題を追加"
              />
              <Button
                size="sm"
                onClick={() => {
                  if (!agendaInput.trim()) return
                  setAgendaTags((prev) => [...prev, agendaInput.trim()])
                  setAgendaInput('')
                }}
              >
                追加
              </Button>
            </div>
          </section>

          <section className="rounded-xl border border-border/60 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                  Related Works
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">関連作業</h2>
              </div>
              <Link2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-lg border border-border/60 bg-slate-50/50 p-3">
                <p className="text-xs font-semibold text-slate-700">AI候補</p>
                <div className="mt-2 space-y-2">
                  {aiCandidates.map((candidate) => (
                    <div key={candidate.work.id} className="flex items-center justify-between text-xs">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {candidate.work.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          スコア: {(candidate.score * 100).toFixed(0)}%
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setRelatedWorkIds((prev) =>
                            prev.includes(candidate.work.id)
                              ? prev
                              : [...prev, candidate.work.id],
                          )
                        }
                      >
                        採用
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={selectedWorkId ? String(selectedWorkId) : ''}
                  onValueChange={(value) =>
                    setSelectedWorkId(value ? Number(value) : '')
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="手動で作業を追加" />
                  </SelectTrigger>
                  <SelectContent>
                    {workList.map((item) => (
                      <SelectItem key={item.work.id} value={String(item.work.id)}>
                        {item.work.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={() => {
                    if (!selectedWorkId) return
                    setRelatedWorkIds((prev) =>
                      prev.includes(Number(selectedWorkId))
                        ? prev
                        : [...prev, Number(selectedWorkId)],
                    )
                    setSelectedWorkId('')
                  }}
                >
                  追加
                </Button>
              </div>
              <div className="space-y-2">
                {relatedWorks.length === 0 ? (
                  <p className="text-xs text-muted-foreground">関連作業はまだありません。</p>
                ) : (
                  relatedWorks.map((item) => (
                    <div key={item.work.id} className="flex items-center justify-between text-xs">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {item.work.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {item.work.work_date}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/works/${item.work.id}`)}
                      >
                        開く
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border/60 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                  Materials
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">会議資料</h2>
              </div>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-3 space-y-2 text-sm">
              {uploads.length === 0 ? (
                <p className="text-xs text-muted-foreground">音声・資料のアップロードはありません。</p>
              ) : (
                uploads.map((upload) => (
                  <div key={upload.id} className="flex items-center justify-between">
                    <span className="text-slate-900">{upload.filename}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(upload.created_at).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                ))
              )}
              <label className="mt-3 inline-flex items-center gap-2 rounded-md border border-border/60 px-3 py-2 text-xs text-muted-foreground">
                ファイル追加
                <input
                  type="file"
                  className="hidden"
                  onChange={(event) => {
                    const files = Array.from(event.target.files ?? []).map((file) => file.name)
                    if (files.length > 0) {
                      void addUploads(files, meetingIdNumber)
                      toast.success(`${files.length} 件のファイルを追加しました。`)
                    }
                    event.currentTarget.value = ''
                  }}
                />
              </label>
            </div>
            <Separator className="my-4 bg-border/40" />
            <div className="space-y-2">
              {materialLinks.map((link) => (
                <div key={link} className="flex items-center justify-between text-xs">
                  <span className="text-blue-700">{link}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setMaterialLinks((prev) => prev.filter((item) => item !== link))}
                  >
                    削除
                  </Button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Input
                  value={materialLink}
                  onChange={(event) => setMaterialLink(event.target.value)}
                  placeholder="資料リンクを追加"
                />
                <Button
                  size="sm"
                  onClick={() => {
                    if (!materialLink.trim()) return
                    setMaterialLinks((prev) => [...prev, materialLink.trim()])
                    setMaterialLink('')
                  }}
                >
                  追加
                </Button>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border/60 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                  AI Workspace
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">AI提案レーン</h2>
              </div>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-sm font-semibold">AI提案</p>
                <div className="mt-2 space-y-2">
                  {[
                    {
                      title: '高温配管エリアの点検タスク追加',
                      confidence: 0.86,
                      reason: '議事録で3回言及・過去事故との関連性高',
                    },
                    {
                      title: '清掃頻度の定期監査を追加',
                      confidence: 0.74,
                      reason: '転倒事故の再発防止策として有効',
                    },
                  ].map((proposal) => (
                    <div key={proposal.title} className="rounded-md border border-border/60 p-2 text-xs">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900">
                          {proposal.title}
                        </p>
                        <span className="rounded-full border border-border/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                          {Math.round(proposal.confidence * 100)}%
                        </span>
                      </div>
                      <p className="mt-1 text-muted-foreground">理由: {proposal.reason}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          採用
                        </Button>
                        <Button size="sm" variant="ghost">
                          有用
                        </Button>
                        <Button size="sm" variant="ghost">
                          不要
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-sm font-semibold">自動下書き</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => toast.info('インシデント下書きを作成しました。')}>
                    インシデント下書き
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toast.info('作業下書きを作成しました。')}>
                    作業下書き
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toast.info('会議サマリーを生成しました。')}>
                    サマリー生成
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-sm font-semibold">説明可能性</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  提案の根拠となる発言、過去のインシデント、関連作業の一致度を提示します。
                </p>
              </div>

              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-sm font-semibold">横断検索</p>
                <div className="mt-2 flex items-center gap-2">
                  <Input placeholder="会議・インシデント・作業を検索" />
                  <Button size="sm" variant="outline">
                    検索
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  検索結果はここに表示されます。
                </p>
              </div>

              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-sm font-semibold">関連性グラフ</p>
                <div className="mt-2 flex items-center justify-center rounded-md border border-dashed border-border/60 p-4 text-xs text-muted-foreground">
                  作業 ↔ 会議 ↔ インシデントの関係グラフ
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
