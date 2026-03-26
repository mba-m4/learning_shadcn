import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/api/client'
import {
  createAddMeetingUploadsMutationOptions,
  createMeetingDetailQueryOptions,
  createMeetingUploadsQueryOptions,
  createUpdateMeetingSyncStateMutationOptions,
} from '@/features/meetings/api/queries'
import type { TranscriptSegment } from '@/features/meetings/components/MeetingTranscriptSection'
import { createWorkListQueryOptions } from '@/features/works/api/queries'

const DEFAULT_DURATION = 960
const DEFAULT_CURRENT_TIME = 120
const DEFAULT_AGENDA_TAGS = ['安全', '設備', '保全']
const DEFAULT_MATERIAL_LINKS = ['https://example.com/meeting-template.pdf']

const DEFAULT_TRANSCRIPTS: TranscriptSegment[] = [
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
]

interface BookmarkItem {
  id: string
  time: number
  note: string
}

export function useMeetingDetailController(meetingIdNumber: number) {
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
  const updateSyncMutation = useMutation(
    createUpdateMeetingSyncStateMutationOptions(meetingIdNumber),
  )
  const addUploadsMutation = useMutation(
    createAddMeetingUploadsMutationOptions(meetingIdNumber),
  )

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(DEFAULT_CURRENT_TIME)
  const [bookmarkNote, setBookmarkNote] = useState('')
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const [transcriptQuery, setTranscriptQuery] = useState('')
  const [agendaInput, setAgendaInput] = useState('')
  const [agendaTags, setAgendaTags] = useState<string[]>(DEFAULT_AGENDA_TAGS)
  const [relatedWorkIds, setRelatedWorkIds] = useState<number[]>([])
  const [selectedWorkId, setSelectedWorkId] = useState<number | ''>('')
  const [materialLink, setMaterialLink] = useState('')
  const [materialLinks, setMaterialLinks] = useState<string[]>(DEFAULT_MATERIAL_LINKS)

  useEffect(() => {
    if (!isPlaying) {
      return
    }

    const timer = window.setInterval(() => {
      setCurrentTime((previousTime) => {
        if (previousTime >= DEFAULT_DURATION) {
          setIsPlaying(false)
          return DEFAULT_DURATION
        }

        return previousTime + 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [isPlaying])

  const meeting = meetingQuery.data
  const uploads = uploadsQuery.data ?? []
  const workList = workListQuery.data?.items ?? []
  const syncState = meeting?.sync_state ?? '待機中'

  const filteredTranscripts = useMemo(() => {
    return DEFAULT_TRANSCRIPTS.filter((segment) => {
      if (transcriptQuery.trim().length === 0) {
        return true
      }

      return segment.text
        .toLowerCase()
        .includes(transcriptQuery.trim().toLowerCase())
    })
  }, [transcriptQuery])

  const activeSegmentId = useMemo(() => {
    return DEFAULT_TRANSCRIPTS.find(
      (segment) => currentTime >= segment.start && currentTime <= segment.end,
    )?.id
  }, [currentTime])

  const aiCandidates = useMemo(() => {
    return workList.slice(0, 3).map((item, index) => ({
      ...item,
      score: [0.92, 0.84, 0.76][index] ?? 0.7,
    }))
  }, [workList])

  const relatedWorks = useMemo(() => {
    return workList.filter((item) => relatedWorkIds.includes(item.work.id))
  }, [relatedWorkIds, workList])

  const handleRefresh = () => {
    void updateSyncMutation
      .mutateAsync({ syncState: '抽出更新中...' })
      .then(() => {
        toast.success('抽出を再実行しました。')
      })
      .catch((error) => {
        toast.error(getErrorMessage(error))
      })
  }

  const handleAddBookmark = () => {
    if (!bookmarkNote.trim()) {
      toast.info('メモを入力してください。')
      return
    }

    setBookmarks((previousBookmarks) => [
      ...previousBookmarks,
      {
        id: `${currentTime}-${previousBookmarks.length + 1}`,
        time: currentTime,
        note: bookmarkNote.trim(),
      },
    ])
    setBookmarkNote('')
  }

  const handleAddAgendaTag = () => {
    if (!agendaInput.trim()) {
      return
    }

    setAgendaTags((previousTags) => [...previousTags, agendaInput.trim()])
    setAgendaInput('')
  }

  const handleAdoptCandidate = (candidateWorkId: number) => {
    setRelatedWorkIds((previousIds) =>
      previousIds.includes(candidateWorkId)
        ? previousIds
        : [...previousIds, candidateWorkId],
    )
  }

  const handleAddSelectedWork = () => {
    if (!selectedWorkId) {
      return
    }

    setRelatedWorkIds((previousIds) =>
      previousIds.includes(Number(selectedWorkId))
        ? previousIds
        : [...previousIds, Number(selectedWorkId)],
    )
    setSelectedWorkId('')
  }

  const handleAddUploads = (files: string[]) => {
    void addUploadsMutation
      .mutateAsync({ files })
      .then(() => {
        toast.success(`${files.length} 件のファイルを追加しました。`)
      })
      .catch((error) => {
        toast.error(getErrorMessage(error))
      })
  }

  const handleAddMaterialLink = () => {
    if (!materialLink.trim()) {
      return
    }

    setMaterialLinks((previousLinks) => [...previousLinks, materialLink.trim()])
    setMaterialLink('')
  }

  const error = meetingQuery.error ?? uploadsQuery.error ?? workListQuery.error
  const isLoading =
    meetingQuery.isLoading || uploadsQuery.isLoading || workListQuery.isLoading

  return {
    activeSegmentId,
    agendaInput,
    agendaTags,
    aiCandidates,
    bookmarkNote,
    bookmarks,
    currentTime,
    duration: DEFAULT_DURATION,
    error,
    filteredTranscripts,
    handleAddAgendaTag,
    handleAddBookmark,
    handleAddMaterialLink,
    handleAddSelectedWork,
    handleAddUploads,
    handleAdoptCandidate,
    handleRefresh,
    hasValidMeetingId,
    isLoading,
    isPlaying,
    isRefreshing: updateSyncMutation.isPending,
    materialLink,
    materialLinks,
    meeting,
    navigate,
    relatedWorks,
    selectedWorkId,
    setAgendaInput,
    setBookmarkNote,
    setCurrentTime,
    setIsPlaying,
    setMaterialLink,
    setSelectedWorkId,
    setTranscriptQuery,
    syncState,
    transcriptQuery,
    uploads,
    workList,
    onOpenWork: (workId: number) => navigate(`/works/${workId}`),
    onRemoveAgendaTag: (tag: string) => {
      setAgendaTags((previousTags) => previousTags.filter((item) => item !== tag))
    },
    onRemoveMaterialLink: (link: string) => {
      setMaterialLinks((previousLinks) => previousLinks.filter((item) => item !== link))
    },
  }
}