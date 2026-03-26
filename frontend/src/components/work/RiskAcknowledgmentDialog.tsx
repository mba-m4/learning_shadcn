import { useLayoutEffect, useRef, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useSafetyStore } from '@/stores/safetyStore'
import { getErrorMessage } from '@/lib/api/client'
import {
  createSubmitAcknowledgmentMutationOptions,
  createWorkAcknowledgmentHistoryQueryOptions,
} from '@/lib/api/queries/safety'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react'
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
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)
  const isDrawingRef = useRef(false)
  const hasStrokeRef = useRef(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSignatureConfirmed, setIsSignatureConfirmed] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null)
  const [canvasNonce, setCanvasNonce] = useState(0)
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

  // リスク一覧
  const allRisks = work.items.flatMap((item) => {
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
  })

  // すべてのリスクが確認されているか
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
    if (!open) {
      setIsSignatureConfirmed(false)
      return
    }
    if (isViewMode) {
      setIsSignatureConfirmed(false)
      return
    }
    setIsSignatureConfirmed(false)
    hasStrokeRef.current = false
    isDrawingRef.current = false
    contextRef.current = null
    setSignature('')
    setCanvasNonce((value) => value + 1)

    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    let rafId = 0
    let observer: ResizeObserver | null = null

    const setupCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width < 10 || rect.height < 10) {
        rafId = window.requestAnimationFrame(setupCanvas)
        return
      }

      const ratio = Math.max(window.devicePixelRatio || 1, 1)
      const width = Math.round(rect.width * ratio)
      const height = Math.round(rect.height * ratio)

      canvas.width = width
      canvas.height = height

      const context = canvas.getContext('2d')
      if (context) {
        context.setTransform(ratio, 0, 0, ratio, 0, 0)
        context.clearRect(0, 0, rect.width, rect.height)
        context.lineWidth = 2
        context.lineCap = 'round'
        context.strokeStyle = '#111827'
      }
      contextRef.current = context
    }

    rafId = window.requestAnimationFrame(setupCanvas)

    if ('ResizeObserver' in window) {
      observer = new ResizeObserver(() => {
        setupCanvas()
      })
      observer.observe(canvas)
    }

    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId)
      }
      if (observer) {
        observer.disconnect()
      }
      contextRef.current = null
      isDrawingRef.current = false
      hasStrokeRef.current = false
    }
  }, [open, isViewMode])

  useLayoutEffect(() => {
    if (!open || !isViewMode) {
      return
    }
    setHistoryLoading(historyQuery.isLoading)
    setSelectedHistoryId((currentId) => currentId ?? history[0]?.id ?? null)
  }, [open, isViewMode, history, historyQuery.isLoading])

  const handleClearSignature = () => {
    const canvas = canvasRef.current
    const context = contextRef.current
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height)
    }
    hasStrokeRef.current = false
    setIsSignatureConfirmed(false)
    setSignature('')
  }

  const ensureContext = () => {
    if (contextRef.current) {
      return contextRef.current
    }
    const canvas = canvasRef.current
    if (!canvas) {
      return null
    }

    const rect = canvas.getBoundingClientRect()
    if (canvas.width === 0 || canvas.height === 0) {
      const ratio = Math.max(window.devicePixelRatio || 1, 1)
      canvas.width = Math.max(1, Math.round(rect.width * ratio))
      canvas.height = Math.max(1, Math.round(rect.height * ratio))
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      }
    }

    const context = canvas.getContext('2d')
    if (context) {
      context.lineWidth = 2
      context.lineCap = 'round'
      context.strokeStyle = '#111827'
    }
    contextRef.current = context
    return context
  }

  const startStroke = (x: number, y: number) => {
    if (isSignatureConfirmed) {
      setIsSignatureConfirmed(false)
      hasStrokeRef.current = false
      setSignature('')
    }
    const context = ensureContext()
    if (!context) {
      return
    }
    setIsSignatureConfirmed(false)
    context.beginPath()
    context.moveTo(x, y)
    context.lineTo(x + 0.1, y + 0.1)
    context.stroke()
    hasStrokeRef.current = true
    isDrawingRef.current = true
  }

  const moveStroke = (x: number, y: number) => {
    if (isSignatureConfirmed) {
      return
    }
    const context = ensureContext()
    if (!context || !isDrawingRef.current) {
      return
    }
    context.lineTo(x, y)
    context.stroke()
    hasStrokeRef.current = true
  }

  const endStroke = () => {
    if (!isDrawingRef.current) {
      return
    }
    isDrawingRef.current = false
    if (hasStrokeRef.current) {
      const canvas = canvasRef.current
      if (canvas) {
        setSignature(canvas.toDataURL('image/png'))
      }
    }
  }

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) {
      return { x: 0, y: 0 }
    }
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    }
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    const { x, y } = getPoint(event)
    startStroke(x, y)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (event.buttons === 1 && !isDrawingRef.current) {
      const { x, y } = getPoint(event)
      startStroke(x, y)
    }
    if (isDrawingRef.current) {
      event.preventDefault()
      const { x, y } = getPoint(event)
      moveStroke(x, y)
    }
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault()
    event.currentTarget.releasePointerCapture(event.pointerId)
    endStroke()
  }

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    event.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    startStroke((event.clientX - rect.left) * scaleX, (event.clientY - rect.top) * scaleY)
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) {
      return
    }
    event.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    moveStroke((event.clientX - rect.left) * scaleX, (event.clientY - rect.top) * scaleY)
  }

  const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    event.preventDefault()
    endStroke()
  }

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
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-semibold text-green-900">リスク確認済み</p>
                  <p className="text-xs text-muted-foreground">
                    {displayAck
                      ? new Date(displayAck.acknowledged_at).toLocaleString('ja-JP')
                      : '日時情報がありません'}
                  </p>
                  {loginId && (
                    <p className="text-xs text-muted-foreground">ログインID: {loginId}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">確認履歴</p>
                {historyLoading ? (
                  <p className="text-sm text-muted-foreground">読み込み中...</p>
                ) : historyQuery.error ? (
                  <p className="text-sm text-destructive">{getErrorMessage(historyQuery.error)}</p>
                ) : history.length === 0 ? (
                  <p className="text-sm text-muted-foreground">履歴がありません。</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {history.map((entry) => (
                      <Button
                        key={entry.id}
                        size="sm"
                        variant={
                          entry.id === selectedHistoryId ? 'default' : 'outline'
                        }
                        onClick={() => setSelectedHistoryId(entry.id)}
                      >
                        {new Date(entry.acknowledged_at).toLocaleString('ja-JP')}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">署名画像</p>
                {displayAck?.signature_base64 ? (
                  <img
                    src={displayAck.signature_base64}
                    alt="署名"
                    className="mt-2 max-w-full rounded-md border border-border/60 bg-white"
                  />
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">署名画像は未登録です。</p>
                )}
              </div>
              {displayAck?.acknowledged_risks?.length ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">確認済みリスク</p>
                  <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-border/60 p-3 text-sm">
                    {displayAck.acknowledged_risks.map((risk) => (
                      <div key={`${risk.source}-${risk.id}`}>
                        <p className="font-medium">
                          {risk.content}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {risk.item_name ?? '作業名なし'}
                        </p>
                        {risk.action && (
                          <p className="text-xs text-muted-foreground">
                            対応: {risk.action}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {!isViewMode && (
            <>
              {/* リスク確認チェックボックス */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">⚠️ 確認が必要なリスク</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3">
                  {allRisks.length === 0 ? (
                    <p className="text-gray-500 text-sm">このリスクはありません</p>
                  ) : (
                    allRisks.map((risk) => (
                      <div
                        key={risk.id}
                        className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded"
                      >
                        <Checkbox
                          checked={acknowledgedRisks.has(risk.riskKey)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              acknowledgeRisk(risk.riskKey)
                            } else {
                              unacknowledgeRisk(risk.riskKey)
                            }
                          }}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{risk.content}</p>
                          <p className="text-xs text-gray-600">
                            作業内容: {risk.itemName}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 署名パッド */}
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="font-semibold text-sm text-blue-900 mb-2">ⓘ 署名ステップ</p>
                  <p className="text-xs text-blue-800">下のスペースに、マウスまたはタッチペンで署名してください。署名後「署名を確定」を押してください。</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">署名エリア</h4>
                  <div className="border-4 border-dashed border-slate-300 rounded-lg overflow-hidden bg-white shadow-sm">
                    <canvas
                      ref={canvasRef}
                      key={`signature-${canvasNonce}`}
                      className="block w-full h-40 cursor-crosshair bg-white relative"
                      style={{ touchAction: 'none', pointerEvents: 'auto', backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 29px, #f3f4f6 29px, #f3f4f6 30px)' }}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerLeave={handlePointerUp}
                      onPointerCancel={handlePointerUp}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {hasStrokeRef.current ? '✓ 署名を検出しました' : '署名してください'}
                  </p>
                </div>

                {/* 署名コントロール */}
                <div className="flex gap-2 justify-between">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleClearSignature}
                    disabled={isSubmitting || !hasStrokeRef.current}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    書き直す
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (hasStrokeRef.current && canvasRef.current) {
                        setSignature(canvasRef.current.toDataURL('image/png'))
                        setIsSignatureConfirmed(true)
                      }
                    }}
                    disabled={isSubmitting || !hasStrokeRef.current}
                    className="gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    署名を確定
                  </Button>
                </div>

                {/* 署名確認済み表示 */}
                {isSignatureConfirmed && signatureData && (
                  <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <p className="text-sm font-semibold text-green-900">署名が確定しました</p>
                    </div>
                    <div className="bg-white border border-green-200 rounded p-3">
                      <img
                        src={signatureData}
                        alt="署名プレビュー"
                        className="max-w-full max-h-24 mx-auto"
                      />
                    </div>
                    <p className="text-xs text-green-800 text-center">
                      {new Date().toLocaleString('ja-JP')}に署名しました
                    </p>
                  </div>
                )}
              </div>

              {/* 法的確認文 */}
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm text-gray-700 space-y-1">
                <p className="font-medium">法的確認</p>
                <p>
                  ✓ 上記のリスクを理解し、必要な対策を講じることを誓約します。
                </p>
                <p>✓ この署名は法的効力を持ちます。</p>
              </div>

              {/* エラーメッセージ */}
              {(error || submitAcknowledgmentMutation.error) && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-sm text-red-700">
                  {error ?? getErrorMessage(submitAcknowledgmentMutation.error)}
                </div>
              )}
            </>
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
