import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/layout/PageHeader'
import { getErrorMessage } from '@/shared/api/client'
import {
  createAddMeetingUploadsMutationOptions,
  createMeetingDetailQueryOptions,
  createMeetingUploadsQueryOptions,
  createUpdateMeetingSyncStateMutationOptions,
} from '@/features/meetings/api/queries'
import { MeetingAudioSection } from '@/features/meetings/components/MeetingAudioSection'
import { MeetingInsightsSection } from '@/features/meetings/components/MeetingInsightsSection'
import { MeetingOverviewCard } from '@/features/meetings/components/MeetingOverviewCard'
import {
  MeetingTranscriptSection,
  type TranscriptSegment,
} from '@/features/meetings/components/MeetingTranscriptSection'
import { MeetingWorkspaceSidebar } from '@/features/meetings/components/MeetingWorkspaceSidebar'
import { createWorkListQueryOptions } from '@/features/works/api/queries'

export default function MeetingDetailPage() {
  const { meetingId } = useParams()
  const meetingIdNumber = Number(meetingId)
  const navigate = useNavigate()
  const hasValidMeetingId = !Number.isNaN(meetingIdNumber)
  const meetingQuery = useQuery({
    ...createMeetingDetailQueryOptions(meetingIdNumber),
    enabled: hasValidMeetingId,
  })
  const uploadsQuery = useQuery({
    ...createMeetingUploadsQueryOptions(meetingIdNumber),
    enabled: hasValidMeetingId,
  })
  const workListQuery = useQuery(
    createWorkListQueryOptions({ limit: 100, offset: 0 }),
  )
  const updateSyncMutation = useMutation(createUpdateMeetingSyncStateMutationOptions(meetingIdNumber))
  const addUploadsMutation = useMutation(createAddMeetingUploadsMutationOptions(meetingIdNumber))
  const meeting = meetingQuery.data
  const workList = workListQuery.data?.items ?? []
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

  const uploads = uploadsQuery.data ?? []

  const aiCandidates = useMemo(() => {
    return workList.slice(0, 3).map((item, index) => ({
      ...item,
      score: [0.92, 0.84, 0.76][index] ?? 0.7,
    }))
  }, [workList])

  const relatedWorks = useMemo(() => {
    return workList.filter((item) => relatedWorkIds.includes(item.work.id))
  }, [relatedWorkIds, workList])

  if (!hasValidMeetingId) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">会議が見つかりません。</p>
        <Button variant="outline" onClick={() => navigate('/meetings')}>
          一覧へ戻る
        </Button>
      </div>
    )
  }

  if (meetingQuery.isLoading || uploadsQuery.isLoading || workListQuery.isLoading) {
    return <div className="space-y-4 text-sm text-muted-foreground">読み込み中...</div>
  }

  if (meetingQuery.error || uploadsQuery.error || workListQuery.error) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">
          {getErrorMessage(meetingQuery.error ?? uploadsQuery.error ?? workListQuery.error)}
        </p>
        <Button variant="outline" onClick={() => navigate('/meetings')}>
          一覧へ戻る
        </Button>
      </div>
    )
  }

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

      <MeetingOverviewCard
        meeting={meeting}
        syncState={syncState}
        isRefreshing={updateSyncMutation.isPending}
        onRefresh={() => {
          void updateSyncMutation.mutateAsync({ syncState: '抽出更新中...' })
            .then(() => {
              toast.success('抽出を再実行しました。')
            })
            .catch((error) => {
              toast.error(getErrorMessage(error))
            })
        }}
      />

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <MeetingAudioSection
            currentTime={currentTime}
            duration={duration}
            isPlaying={isPlaying}
            bookmarkNote={bookmarkNote}
            bookmarks={bookmarks}
            onTogglePlay={() => setIsPlaying((prev) => !prev)}
            onTimeChange={setCurrentTime}
            onBookmarkNoteChange={setBookmarkNote}
            onAddBookmark={() => {
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
            onSelectBookmark={setCurrentTime}
          />

          <MeetingTranscriptSection
            transcriptQuery={transcriptQuery}
            filteredTranscripts={filteredTranscripts}
            activeSegmentId={activeSegmentId}
            onTranscriptQueryChange={setTranscriptQuery}
            onSelectSegment={setCurrentTime}
          />

          <MeetingInsightsSection
            extractedRisks={meeting.extracted_risks}
            onAddRisk={() => toast.success('リスク台帳に追加しました。')}
          />
        </div>

        <MeetingWorkspaceSidebar
          agendaTags={agendaTags}
          agendaInput={agendaInput}
          aiCandidates={aiCandidates}
          selectedWorkId={selectedWorkId}
          workList={workList}
          relatedWorks={relatedWorks}
          uploads={uploads}
          materialLinks={materialLinks}
          materialLink={materialLink}
          onAgendaInputChange={setAgendaInput}
          onAddAgendaTag={() => {
            if (!agendaInput.trim()) return
            setAgendaTags((prev) => [...prev, agendaInput.trim()])
            setAgendaInput('')
          }}
          onRemoveAgendaTag={(tag) => {
            setAgendaTags((prev) => prev.filter((item) => item !== tag))
          }}
          onAdoptCandidate={(candidateWorkId) => {
            setRelatedWorkIds((prev) =>
              prev.includes(candidateWorkId) ? prev : [...prev, candidateWorkId],
            )
          }}
          onSelectWorkId={setSelectedWorkId}
          onAddSelectedWork={() => {
            if (!selectedWorkId) return
            setRelatedWorkIds((prev) =>
              prev.includes(Number(selectedWorkId)) ? prev : [...prev, Number(selectedWorkId)],
            )
            setSelectedWorkId('')
          }}
          onOpenWork={(nextWorkId) => navigate(`/works/${nextWorkId}`)}
          onAddUploads={(files) => {
            void addUploadsMutation.mutateAsync({ files })
              .then(() => {
                toast.success(`${files.length} 件のファイルを追加しました。`)
              })
              .catch((error) => {
                toast.error(getErrorMessage(error))
              })
          }}
          onMaterialLinkChange={setMaterialLink}
          onAddMaterialLink={() => {
            if (!materialLink.trim()) return
            setMaterialLinks((prev) => [...prev, materialLink.trim()])
            setMaterialLink('')
          }}
          onRemoveMaterialLink={(link) => {
            setMaterialLinks((prev) => prev.filter((item) => item !== link))
          }}
        />
      </div>
    </div>
  )
}
