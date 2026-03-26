import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { WorkRiskAcknowledgment } from '@/types/api'

interface WorkAcknowledgmentSectionProps {
  acknowledgment: WorkRiskAcknowledgment | null
  onOpen: () => void
}

export default function WorkAcknowledgmentSection({
  acknowledgment,
  onOpen,
}: WorkAcknowledgmentSectionProps) {
  return (
    <section className="rounded-xl border border-border/60 bg-white px-6 py-6">
      {acknowledgment ? (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">✓ リスク確認済み</p>
              <p className="text-sm text-green-700">
                {new Date(acknowledgment.acknowledged_at).toLocaleString('ja-JP')}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={onOpen}>
            確認済みの詳細を見る
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold">⚠️ リスク確認が必要</p>
            <p className="text-sm text-muted-foreground">
              作業開始前に本日のリスクを確認してください
            </p>
          </div>
          <Button onClick={onOpen}>リスク確認を開始</Button>
        </div>
      )}
    </section>
  )
}