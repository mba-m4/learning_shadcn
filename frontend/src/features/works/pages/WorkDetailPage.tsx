import { useNavigate, useParams } from 'react-router-dom'
import { getErrorMessage } from '@/shared/api/client'
import { IncidentCreateDialog } from '@/features/works/ui/IncidentCreateDialog'
import { useWorkDetailController } from '@/features/works/model/useWorkDetailController'
import WorkAcknowledgmentSection from '@/features/works/ui/WorkAcknowledgmentSection'
import WorkDetailCommentsSection from '@/features/works/ui/WorkDetailCommentsSection'
import WorkDetailHeaderSection from '@/features/works/ui/WorkDetailHeaderSection'
import WorkDetailIncidentsSection from '@/features/works/ui/WorkDetailIncidentsSection'
import WorkDetailSummarySection from '@/features/works/ui/WorkDetailSummarySection'
import { RiskAcknowledgmentDialog } from '@/features/works/ui/RiskAcknowledgmentDialog'
import RiskActionSection from '@/features/works/ui/RiskActionSection'
import { Button } from '@/components/ui/button'

export default function WorkDetailPage() {
  const { workId } = useParams()
  const workIdNumber = Number(workId)
  const navigate = useNavigate()
  const controller = useWorkDetailController(workIdNumber)

  if (Number.isNaN(workIdNumber)) {
    return <p className="text-sm">作業IDが不正です。</p>
  }

  if (controller.workDetailQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">読み込み中...</p>
  }

  if (controller.workDetailQuery.error) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{getErrorMessage(controller.workDetailQuery.error)}</p>
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          ダッシュボードに戻る
        </Button>
      </div>
    )
  }

  if (!controller.detail) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">作業情報が見つかりませんでした。</p>
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          ダッシュボードに戻る
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <WorkDetailHeaderSection
        detail={controller.detail}
        onBack={() => navigate(-1)}
        onOpenExplorer={() => navigate('/works/explorer')}
      />

      <WorkDetailSummarySection
        onOpenManuals={() => navigate('/manuals')}
        relatedIncidents={controller.relatedIncidentsSorted}
        relatedManuals={controller.relatedManuals}
        relatedRisks={controller.relatedRisks}
      />

      {controller.detail.items.length > 0 && (
        <WorkAcknowledgmentSection
          acknowledgment={controller.acknowledgment}
          onOpen={() => controller.setShowAcknowledgmentDialog(true)}
        />
      )}

      <RiskActionSection
        items={controller.detail.items}
        manualRisksByItemId={controller.manualRisksByItemId}
        canGenerate={controller.canGenerate}
        canManual={controller.canManual}
        onGenerateRisk={controller.handleGenerateRisk}
        onAddManualRisk={controller.handleAddManualRisk}
        onUpdateManualRisk={controller.handleUpdateManualRisk}
        onDeleteManualRisk={controller.handleDeleteManualRisk}
        onUpdateAiRisk={controller.handleUpdateAiRisk}
        onDeleteAiRisk={controller.handleDeleteAiRisk}
      />

      <WorkDetailIncidentsSection
        incidents={controller.relatedIncidents}
        onCreate={() => controller.setShowIncidentDialog(true)}
        onOpenIncident={(incidentId) => navigate(`/incidents/${incidentId}`)}
      />

      <WorkDetailCommentsSection
        canComment={controller.canComment}
        comments={controller.comments}
        errorMessage={
          controller.commentsQuery.error
            ? getErrorMessage(controller.commentsQuery.error)
            : null
        }
        loading={controller.commentsQuery.isLoading}
        onAddComment={controller.handleAddComment}
      />

      <RiskAcknowledgmentDialog
        open={controller.showAcknowledgmentDialog}
        onOpenChange={controller.setShowAcknowledgmentDialog}
        work={controller.detail}
        manualRisksByItemId={controller.manualRisksByItemId}
        mode={controller.acknowledgment ? 'view' : 'confirm'}
        acknowledgment={controller.acknowledgment}
        loginId={controller.loginId}
        onComplete={() => {
          void controller.refetchAcknowledgment()
        }}
      />

      <IncidentCreateDialog
        open={controller.showIncidentDialog}
        onOpenChange={controller.setShowIncidentDialog}
        workId={workIdNumber}
        workTitle={controller.detail.work.title}
        onSubmit={controller.handleCreateIncident}
      />
    </div>
  )
}
