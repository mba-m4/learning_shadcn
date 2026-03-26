import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { CheckCircle2, Trash2 } from 'lucide-react'
import type { AcknowledgmentRiskItem } from '@/features/works/model/acknowledgment'

interface Props {
  allRisks: AcknowledgmentRiskItem[]
  acknowledgedRisks: Set<string>
  errorMessage: string | null
  hasStroke: boolean
  isSignatureConfirmed: boolean
  isSubmitting: boolean
  signatureData: string | null
  signatureTimestamp: string
  canvasNonce: number
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  onToggleRisk(riskKey: string, checked: boolean): void
  onClearSignature(): void
  onConfirmSignature(): void
  onPointerDown(event: React.PointerEvent<HTMLCanvasElement>): void
  onPointerMove(event: React.PointerEvent<HTMLCanvasElement>): void
  onPointerUp(event: React.PointerEvent<HTMLCanvasElement>): void
  onMouseDown(event: React.MouseEvent<HTMLCanvasElement>): void
  onMouseMove(event: React.MouseEvent<HTMLCanvasElement>): void
  onMouseUp(event: React.MouseEvent<HTMLCanvasElement>): void
}

export function RiskAcknowledgmentConfirmForm({
  allRisks,
  acknowledgedRisks,
  errorMessage,
  hasStroke,
  isSignatureConfirmed,
  isSubmitting,
  signatureData,
  signatureTimestamp,
  canvasNonce,
  canvasRef,
  onToggleRisk,
  onClearSignature,
  onConfirmSignature,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onMouseDown,
  onMouseMove,
  onMouseUp,
}: Props) {
  return (
    <>
      <div className="space-y-3">
        <h4 className="text-sm font-semibold">⚠️ 確認が必要なリスク</h4>
        <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border p-3">
          {allRisks.length === 0 ? (
            <p className="text-sm text-gray-500">このリスクはありません</p>
          ) : (
            allRisks.map((risk) => (
              <div
                key={risk.riskKey}
                className="flex items-start gap-3 rounded p-2 hover:bg-gray-50"
              >
                <Checkbox
                  checked={acknowledgedRisks.has(risk.riskKey)}
                  onCheckedChange={(checked) => onToggleRisk(risk.riskKey, Boolean(checked))}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{risk.content}</p>
                  <p className="text-xs text-gray-600">作業内容: {risk.itemName}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="mb-2 text-sm font-semibold text-blue-900">ⓘ 署名ステップ</p>
          <p className="text-xs text-blue-800">
            下のスペースに、マウスまたはタッチペンで署名してください。署名後「署名を確定」を押してください。
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold">署名エリア</h4>
          <div className="overflow-hidden rounded-lg border-4 border-dashed border-slate-300 bg-white shadow-sm">
            <canvas
              ref={canvasRef}
              key={`signature-${canvasNonce}`}
              className="relative block h-40 w-full cursor-crosshair bg-white"
              style={{
                touchAction: 'none',
                pointerEvents: 'auto',
                backgroundImage:
                  'repeating-linear-gradient(90deg, transparent, transparent 29px, #f3f4f6 29px, #f3f4f6 30px)',
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
              onPointerCancel={onPointerUp}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            />
          </div>
          <p className="text-center text-xs text-muted-foreground">
            {hasStroke ? '✓ 署名を検出しました' : '署名してください'}
          </p>
        </div>

        <div className="flex justify-between gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onClearSignature}
            disabled={isSubmitting || !hasStroke}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            書き直す
          </Button>
          <Button
            size="sm"
            onClick={onConfirmSignature}
            disabled={isSubmitting || !hasStroke}
            className="gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            署名を確定
          </Button>
        </div>

        {isSignatureConfirmed && signatureData && (
          <div className="space-y-3 rounded-lg border-2 border-green-300 bg-green-50 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="text-sm font-semibold text-green-900">署名が確定しました</p>
            </div>
            <div className="rounded border border-green-200 bg-white p-3">
              <img
                src={signatureData}
                alt="署名プレビュー"
                className="mx-auto max-h-24 max-w-full"
              />
            </div>
            <p className="text-center text-xs text-green-800">{signatureTimestamp}に署名しました</p>
          </div>
        )}
      </div>

      <div className="space-y-1 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-gray-700">
        <p className="font-medium">法的確認</p>
        <p>✓ 上記のリスクを理解し、必要な対策を講じることを誓約します。</p>
        <p>✓ この署名は法的効力を持ちます。</p>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}
    </>
  )
}