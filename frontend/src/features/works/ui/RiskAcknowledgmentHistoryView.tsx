import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'
import type { WorkRiskAcknowledgment } from '@/types/api'

interface Props {
  displayAck: WorkRiskAcknowledgment | null
  history: WorkRiskAcknowledgment[]
  historyLoading: boolean
  historyErrorMessage: string | null
  loginId?: string | null
  selectedHistoryId: number | null
  onSelectHistory(id: number): void
}

export function RiskAcknowledgmentHistoryView({
  displayAck,
  history,
  historyLoading,
  historyErrorMessage,
  loginId,
  selectedHistoryId,
  onSelectHistory,
}: Props) {
  return (
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
        ) : historyErrorMessage ? (
          <p className="text-sm text-destructive">{historyErrorMessage}</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-muted-foreground">履歴がありません。</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {history.map((entry) => (
              <Button
                key={entry.id}
                size="sm"
                variant={entry.id === selectedHistoryId ? 'default' : 'outline'}
                onClick={() => onSelectHistory(entry.id)}
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
                <p className="font-medium">{risk.content}</p>
                <p className="text-xs text-muted-foreground">
                  {risk.item_name ?? '作業名なし'}
                </p>
                {risk.action && (
                  <p className="text-xs text-muted-foreground">対応: {risk.action}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}