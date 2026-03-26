import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/layout/PageHeader'
import { useManualStore } from '@/stores/manualStore'

export default function ManualDetailPage() {
  const { manualId } = useParams()
  const manualIdNumber = Number(manualId)
  const navigate = useNavigate()
  const { manuals, fetchManual } = useManualStore()
  const manual = useMemo(
    () => manuals.find((item) => item.id === manualIdNumber),
    [manualIdNumber, manuals],
  )

  useEffect(() => {
    if (Number.isNaN(manualIdNumber)) {
      return
    }
    void fetchManual(manualIdNumber)
  }, [fetchManual, manualIdNumber])

  if (!manual) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">手順書が見つかりません。</p>
        <Button variant="outline" onClick={() => navigate('/manuals')}>
          一覧へ戻る
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Manual Detail"
        subtitle="手順書の詳細を確認します。"
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/manuals')}>
            一覧へ戻る
          </Button>
        }
      />
      <section className="rounded-xl border border-border/60 bg-white p-6">
        <h2 className="text-2xl font-semibold text-slate-900">{manual.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{manual.category}</p>
        <p className="mt-4 text-sm text-muted-foreground">{manual.summary}</p>
        <p className="mt-4 text-xs text-muted-foreground">更新日: {manual.updated_at}</p>
      </section>
    </div>
  )
}
