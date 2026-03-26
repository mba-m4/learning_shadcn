import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/layout/PageHeader'
import { getErrorMessage } from '@/shared/api/client'
import { MeetingAudioSection } from '@/features/meetings/components/MeetingAudioSection'
import { MeetingInsightsSection } from '@/features/meetings/components/MeetingInsightsSection'
import { MeetingOverviewCard } from '@/features/meetings/components/MeetingOverviewCard'
import { MeetingTranscriptSection } from '@/features/meetings/components/MeetingTranscriptSection'
import { MeetingWorkspaceSidebar } from '@/features/meetings/components/MeetingWorkspaceSidebar'
import { useMeetingDetailController } from '@/features/meetings/model/useMeetingDetailController'

export default function MeetingDetailPage() {
  const { meetingId } = useParams()
  const meetingIdNumber = Number(meetingId)
  const {
    activeSegmentId,
    agendaInput,
    agendaTags,
    aiCandidates,
    bookmarkNote,
    bookmarks,
    currentTime,
    duration,
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
    isRefreshing,
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
    onOpenWork,
    onRemoveAgendaTag,
    onRemoveMaterialLink,
  } = useMeetingDetailController(meetingIdNumber)

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

  if (isLoading) {
    return <div className="space-y-4 text-sm text-muted-foreground">読み込み中...</div>
  }

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">{getErrorMessage(error)}</p>
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
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <MeetingAudioSection
            currentTime={currentTime}
            duration={duration}
            isPlaying={isPlaying}
            bookmarkNote={bookmarkNote}
            bookmarks={bookmarks}
            onTogglePlay={() => setIsPlaying((previousValue) => !previousValue)}
            onTimeChange={setCurrentTime}
            onBookmarkNoteChange={setBookmarkNote}
            onAddBookmark={handleAddBookmark}
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
          onAddAgendaTag={handleAddAgendaTag}
          onRemoveAgendaTag={onRemoveAgendaTag}
          onAdoptCandidate={handleAdoptCandidate}
          onSelectWorkId={setSelectedWorkId}
          onAddSelectedWork={handleAddSelectedWork}
          onOpenWork={onOpenWork}
          onAddUploads={handleAddUploads}
          onMaterialLinkChange={setMaterialLink}
          onAddMaterialLink={handleAddMaterialLink}
          onRemoveMaterialLink={onRemoveMaterialLink}
        />
      </div>
    </div>
  )
}