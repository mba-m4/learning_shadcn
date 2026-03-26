import { useLayoutEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useSafetyStore } from '@/stores/safetyStore'
import { getErrorMessage } from '@/shared/api/client'
import {
  createSubmitAcknowledgmentMutationOptions,
  createWorkAcknowledgmentHistoryQueryOptions,
} from '@/features/works/api/queries'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { AcknowledgmentRiskItem } from '@/features/works/model/acknowledgment'
import { useSignaturePad } from '@/features/works/model/useSignaturePad'
import { RiskAcknowledgmentConfirmForm } from '@/features/works/ui/RiskAcknowledgmentConfirmForm'
import { RiskAcknowledgmentHistoryView } from '@/features/works/ui/RiskAcknowledgmentHistoryView'
import type { ManualRisk, WorkOverview, WorkRiskAcknowledgment } from '@/types/api'

interface Props {
  open: boolean
  onOpenChange(open: boolean): void
  work: WorkOverview
  manualRisksByItemId: Record<number, ManualRisk[]>
  mode?: 'confirm' | 'view'
  acknowledgment?: WorkRiskAcknowledgment | null
  loginId?: string | null
  onComplete(): void
}

export function RiskAcknowledgmentDialog({
  open,
  onOpenChange,
  work,
  manualRisksByItemId,
  mode = 'confirm',
  acknowledgment,
  loginId,
  onComplete,
}: Props) {
  const isViewMode = mode === 'view'
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null)
  const historyQuery = useQuery({
    ...createWorkAcknowledgmentHistoryQueryOptions(work.work.id),
    enabled: open && isViewMode,
  })
  const submitAcknowledgmentMutation = useMutation(
    createSubmitAcknowledgmentMutationOptions(work.work.id),
  )
  const history = historyQuery.data ?? []

  const {
    acknowledgeRisk,
    unacknowledgeRisk,
    acknowledgedRisks,
    signatureData,
    setSignature,
    error,
    resetForm,
  } = useSafetyStore()

  const signaturePad = useSignaturePad({
    open,
    enabled: !isViewMode,
    setSignature,
  })

  const allRisks = useMemo<AcknowledgmentRiskItem[]>(() => work.items.flatMap((item) => {
    const manual = (manualRisksByItemId[item.item.id] || []).map((risk) => ({
      id: risk.id,
      source: 'manual' as const,
      content: risk.content,
      action: risk.action ?? null,
      itemName: item.item.name,
      riskKey: `manual-${risk.id}`,
    }))
    const ai = item.risks.map((risk) => ({
      id: risk.id,
      source: 'ai' as const,
      content: risk.content,
      action: risk.action ?? null,
      itemName: item.item.name,
      riskKey: `ai-${risk.id}`,
    }))
    return [...manual, ...ai]
  }), [manualRisksByItemId, work.items])

  const allAcknowledged =
    allRisks.length > 0 &&
    allRisks.every((r) => acknowledgedRisks.has(r.riskKey))

  const dialogTitle = isViewMode ? 'リスク確認済み' : '本日のリスク確認'
  const dialogDescription = isViewMode
    ? '確認済みのユーザー、時刻、署名を表示します。'
    : '作業開始前に、下記のリスクを確認し署名してください'

  const selectedHistory = history.find((entry) => entry.id === selectedHistoryId)
  const displayAck = isViewMode ? selectedHistory ?? acknowledgment ?? null : null

  useLayoutEffect(() => {
    if (!open || !isViewMode) {
      return
    }
    setSelectedHistoryId((currentId) => currentId ?? history[0]?.id ?? null)
  }, [open, isViewMode, history])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const selectedRisks = allRisks
        .filter((risk) => acknowledgedRisks.has(risk.riskKey))
        .map((risk) => ({
          id: risk.id,
          source: risk.source,
          content: risk.content,
          action: risk.action,
          item_name: risk.itemName,
        }))
      await submitAcknowledgmentMutation.mutateAsync({
        signature_base64: signatureData,
        acknowledged_risk_ids: selectedRisks.map((risk) => risk.id),
        acknowledged_risks: selectedRisks,
      })
      resetForm()
      onOpenChange(false)
      onComplete()
    } catch {
      // エラーはtostで表示済み
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isViewMode ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            )}
            {dialogTitle}
          </DialogTitle>
          <DialogDescription>
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {isViewMode && (
            <RiskAcknowledgmentHistoryView
              displayAck={displayAck}
              history={history}
              historyLoading={historyQuery.isLoading}
              historyErrorMessage={historyQuery.error ? getErrorMessage(historyQuery.error) : null}
              loginId={loginId}
              selectedHistoryId={selectedHistoryId}
              onSelectHistory={setSelectedHistoryId}
            />
          )}

          {!isViewMode && (
            <RiskAcknowledgmentConfirmForm
              allRisks={allRisks}
              acknowledgedRisks={acknowledgedRisks}
              errorMessage={error ?? getErrorMessage(submitAcknowledgmentMutation.error)}
              hasStroke={signaturePad.hasStroke}
              isSignatureConfirmed={signaturePad.isSignatureConfirmed}
              isSubmitting={isSubmitting}
              signatureData={signatureData}
              signatureTimestamp={new Date().toLocaleString('ja-JP')}
              canvasNonce={signaturePad.canvasNonce}
              canvasRef={signaturePad.canvasRef}
              onToggleRisk={(riskKey, checked) => {
                if (checked) {
                  acknowledgeRisk(riskKey)
                } else {
                  unacknowledgeRisk(riskKey)
                }
              }}
              onClearSignature={signaturePad.clearSignature}
              onConfirmSignature={signaturePad.confirmSignature}
              onPointerDown={signaturePad.handlePointerDown}
              onPointerMove={signaturePad.handlePointerMove}
              onPointerUp={signaturePad.handlePointerUp}
              onMouseDown={signaturePad.handleMouseDown}
              onMouseMove={signaturePad.handleMouseMove}
              onMouseUp={signaturePad.handleMouseUp}
            />
          )}
        </div>

        <DialogFooter>
          {isViewMode ? (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              閉じる
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  resetForm()
                  onOpenChange(false)
                }}
                disabled={isSubmitting || submitAcknowledgmentMutation.isPending}
              >
                キャンセル
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!allAcknowledged || !signatureData || isSubmitting || submitAcknowledgmentMutation.isPending}
                className="min-w-32"
              >
                {isSubmitting || submitAcknowledgmentMutation.isPending ? '処理中...' : '✓ 確認完了、作業開始'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
