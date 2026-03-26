import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import CommentForm from '@/components/comments/CommentForm'
import CommentList from '@/components/comments/CommentList'
import RiskActionSection from '@/components/work/RiskActionSection'
import WorkItemList from '@/components/work/WorkItemList'
import { RiskAcknowledgmentDialog } from '@/components/work/RiskAcknowledgmentDialog'
import { IncidentCreateDialog } from '@/components/work/IncidentCreateDialog'
import { deleteRiskAssessment, updateRiskAssessment } from '@/lib/api/risks'
import { generateRisk, fetchWorkDetail } from '@/lib/api/works'
import { getErrorMessage } from '@/lib/api/client'
import { useAuthStore } from '@/stores/authStore'
import { useCommentStore } from '@/stores/commentStore'
import { useRiskStore } from '@/stores/riskStore'
import { useWorkStore } from '@/stores/workStore'
import { useSafetyStore } from '@/stores/safetyStore'
import { useIncidentStore } from '@/stores/incidentStore'
import { useManualStore } from '@/stores/manualStore'
import { CheckCircle2 } from 'lucide-react'
import type { Role, WorkOverview } from '@/types/api'

const canCommentRoles: Role[] = ['leader', 'worker']

export default function WorkDetailPage() {
  const { workId } = useParams()
  const workIdNumber = Number(workId)
  const navigate = useNavigate()
  const { currentUser, loginId } = useAuthStore()
  const { date, dailyOverview, fetchDailyOverview, loadingDaily } = useWorkStore()
  const {
    commentsByWorkId,
    loadingByWorkId,
    fetchComments,
    addComment,
  } = useCommentStore()
  const {
    manualRisksByItemId,
    fetchManualRisks,
    addManualRisk,
    updateManualRisk,
    deleteManualRisk,
  } = useRiskStore()
  const { acknowledgments, fetchAcknowledgment } = useSafetyStore()
  const { incidents, createIncident, fetchIncidents } = useIncidentStore()
  const { manuals, fetchManuals } = useManualStore()
  const [detail, setDetail] = useState<WorkOverview | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [showAcknowledgmentDialog, setShowAcknowledgmentDialog] = useState(false)
  const [showIncidentDialog, setShowIncidentDialog] = useState(false)

  const overview = useMemo(() => {
    return dailyOverview.find((item) => item.work.id === workIdNumber)
  }, [dailyOverview, workIdNumber])

  const relatedIncidents = useMemo(() => {
    return incidents.filter((incident) => incident.work_id === workIdNumber)
  }, [incidents, workIdNumber])

  const relatedIncidentsSorted = useMemo(() => {
    return [...relatedIncidents].sort((a, b) => b.date.localeCompare(a.date))
  }, [relatedIncidents])

  const relatedRisks = useMemo(() => {
    if (!detail) {
      return { total: 0, items: [] as Array<{ id: string; content: string; source: string }> }
    }
    const manual = Object.values(manualRisksByItemId).flat().map((risk) => ({
      id: `manual-${risk.id}`,
      content: risk.content,
      source: '手入力',
    }))
    const ai = detail.items
      .flatMap((entry) => entry.risks ?? [])
      .map((risk) => ({
        id: `ai-${risk.id}`,
        content: risk.content,
        source: 'AI',
      }))
    const combined = [...manual, ...ai]
    return {
      total: combined.length,
      items: combined.slice(0, 3),
    }
  }, [detail, manualRisksByItemId])

  const relatedManuals = useMemo(() => {
    return [...manuals]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 3)
  }, [manuals])

  useEffect(() => {
    if (!workIdNumber) {
      return
    }
    if (overview) {
      setDetail(overview)
      setDetailError(null)
      return
    }

    let cancelled = false
    setLoadingDetail(true)
    setDetailError(null)

    fetchWorkDetail(workIdNumber)
      .then((data) => {
        if (cancelled) return
        setDetail(data)
      })
      .catch((error) => {
        if (cancelled) return
        setDetailError(getErrorMessage(error))
      })
      .finally(() => {
        if (cancelled) return
        setLoadingDetail(false)
      })

    return () => {
      cancelled = true
    }
  }, [overview, workIdNumber])

  useEffect(() => {
    if (!dailyOverview.length) {
      void fetchDailyOverview(date)
    }
  }, [dailyOverview.length, date, fetchDailyOverview])

  useEffect(() => {
    if (workIdNumber) {
      void fetchComments(workIdNumber)
      void fetchAcknowledgment(workIdNumber)
      void fetchIncidents()
      void fetchManuals()
    }
  }, [fetchComments, workIdNumber, fetchAcknowledgment, fetchIncidents, fetchManuals])

  useEffect(() => {
    if (!detail) {
      return
    }
    detail.items.forEach(({ item }) => {
      void fetchManualRisks(item.id)
    })
  }, [detail, fetchManualRisks])

  const handleCreateIncident = async (data: {
    title: string
    type: 'incident' | 'near_miss'
    root_cause: string
    corrective_actions: string[]
    work_id?: number
  }) => {
    const created = await createIncident({
      ...data,
      date: new Date().toISOString().split('T')[0],
      status: 'open',
    })

    if (created) {
      toast.success('インシデントを登録しました。')
      await fetchIncidents()
    } else {
      toast.error('登録に失敗しました。')
    }
  }

  const handleGenerateRisk = async (itemId: number) => {
    try {
      const created = await generateRisk(itemId)
      setDetail((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          items: prev.items.map((entry) =>
            entry.item.id === itemId
              ? {
                  ...entry,
                  risks: [created, ...entry.risks.filter((risk) => risk.id !== created.id)],
                }
              : entry,
          ),
        }
      })
      toast.success('リスクを生成しました。')
      await fetchDailyOverview(date)
      void fetchAcknowledgment(workIdNumber)
    } catch (error) {
      toast.error('リスク生成に失敗しました。')
    }
  }

  const handleAddComment = async (content: string) => {
    const created = await addComment(workIdNumber, content)
    if (created) {
      toast.success('コメントを追加しました。')
    } else {
      toast.error('コメントの追加に失敗しました。')
    }
  }

  const handleAddManualRisk = async (
    itemId: number,
    content: string,
    action?: string | null,
  ) => {
    const created = await addManualRisk(itemId, content, action)
    if (created) {
      toast.success('手入力リスクを追加しました。')
      void fetchAcknowledgment(workIdNumber)
      return true
    }
    toast.error('手入力リスクの追加に失敗しました。')
    return false
  }

  const handleUpdateManualRisk = async (
    itemId: number,
    riskId: number,
    payload: { content?: string | null; action?: string | null },
  ) => {
    const updated = await updateManualRisk(itemId, riskId, payload)
    if (updated) {
      toast.success('リスクを更新しました。')
      void fetchAcknowledgment(workIdNumber)
      return true
    }
    toast.error('リスクの更新に失敗しました。')
    return false
  }

  const handleDeleteManualRisk = async (itemId: number, riskId: number) => {
    const deleted = await deleteManualRisk(itemId, riskId)
    if (deleted) {
      toast.success('リスクを削除しました。')
      void fetchAcknowledgment(workIdNumber)
      return true
    }
    toast.error('リスクの削除に失敗しました。')
    return false
  }

  const handleUpdateAiRisk = async (
    itemId: number,
    riskId: number,
    payload: { content?: string | null; action?: string | null },
  ) => {
    try {
      const updated = await updateRiskAssessment(riskId, payload)
      setDetail((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          items: prev.items.map((entry) =>
            entry.item.id === itemId
              ? {
                  ...entry,
                  risks: entry.risks.map((risk) =>
                    risk.id === riskId ? updated : risk,
                  ),
                }
              : entry,
          ),
        }
      })
      toast.success('リスクを更新しました。')
      void fetchAcknowledgment(workIdNumber)
      return true
    } catch (error) {
      toast.error('リスクの更新に失敗しました。')
      return false
    }
  }

  const handleDeleteAiRisk = async (itemId: number, riskId: number) => {
    try {
      await deleteRiskAssessment(riskId)
      setDetail((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          items: prev.items.map((entry) =>
            entry.item.id === itemId
              ? {
                  ...entry,
                  risks: entry.risks.filter((risk) => risk.id !== riskId),
                }
              : entry,
          ),
        }
      })
      toast.success('リスクを削除しました。')
      void fetchAcknowledgment(workIdNumber)
      return true
    } catch (error) {
      toast.error('リスクの削除に失敗しました。')
      return false
    }
  }

  if (!workIdNumber) {
    return <p className="text-sm">作業IDが不正です。</p>
  }

  if ((loadingDaily || loadingDetail) && !detail) {
    return <p className="text-sm text-muted-foreground">読み込み中...</p>
  }

  if (!detail) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {detailError ?? '作業情報が見つかりませんでした。'}
        </p>
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          ダッシュボードに戻る
        </Button>
      </div>
    )
  }

  const canGenerate = currentUser?.role === 'leader'
  const canComment = currentUser ? canCommentRoles.includes(currentUser.role) : false
  const canManual = canComment
  const comments = commentsByWorkId[workIdNumber] || []

  const statusLabel = {
    draft: '下書き',
    confirmed: '確定',
  }

  const statusTone = {
    draft: 'text-amber-700 bg-amber-50',
    confirmed: 'text-emerald-700 bg-emerald-50',
  }


  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border/60 bg-white px-6 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Work Detail
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {detail.work.title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {detail.work.description}
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`rounded-full px-2 py-0.5 font-semibold ${statusTone[detail.work.status]}`}>
              {statusLabel[detail.work.status]}
            </span>
            <span className="rounded-full border border-border/60 px-2 py-0.5 text-muted-foreground">
              作業日: {detail.work.work_date}
            </span>
            <span className="rounded-full border border-border/60 px-2 py-0.5 text-muted-foreground">
              グループ: {detail.work.group_id}
            </span>
            <span className="rounded-full border border-border/60 px-2 py-0.5 text-muted-foreground">
              作業ID: {detail.work.id}
            </span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => navigate('/works/explorer')}>
                全件ビューへ
              </Button>
              <Button size="sm" onClick={() => navigate(-1)}>
                戻る
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <WorkItemList items={detail.items} />
        </div>
      </section>

      <section className="rounded-xl border border-border/60 bg-white px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Related Summary
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">関連サマリー</h2>
          </div>
          <Button size="sm" variant="outline" onClick={() => navigate('/manuals')}>
            手順書を見る
          </Button>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-border/60 bg-slate-50/40 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">関連リスク</p>
              <span className="rounded-full border border-border/60 px-2 py-0.5 text-xs text-muted-foreground">
                {relatedRisks.total} 件
              </span>
            </div>
            {relatedRisks.items.length === 0 ? (
              <p className="mt-3 text-xs text-muted-foreground">関連リスクはありません</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {relatedRisks.items.map((risk) => (
                  <li key={risk.id} className="text-xs text-slate-700">
                    <span className="mr-2 rounded-full border border-border/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      {risk.source}
                    </span>
                    {risk.content}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-lg border border-border/60 bg-slate-50/40 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">関連インシデント</p>
              <span className="rounded-full border border-border/60 px-2 py-0.5 text-xs text-muted-foreground">
                {relatedIncidents.length} 件
              </span>
            </div>
            {relatedIncidentsSorted.length === 0 ? (
              <p className="mt-3 text-xs text-muted-foreground">関連インシデントはありません</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {relatedIncidentsSorted.slice(0, 3).map((incident) => (
                  <li key={incident.id} className="text-xs text-slate-700">
                    {incident.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-lg border border-border/60 bg-slate-50/40 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">関連マニュアル</p>
              <span className="rounded-full border border-border/60 px-2 py-0.5 text-xs text-muted-foreground">
                {relatedManuals.length} 件
              </span>
            </div>
            {relatedManuals.length === 0 ? (
              <p className="mt-3 text-xs text-muted-foreground">関連マニュアルはありません</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {relatedManuals.map((manual) => (
                  <li key={manual.id} className="text-xs text-slate-700">
                    {manual.title}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-[11px] text-muted-foreground">最近更新の手順書を表示</p>
          </div>
        </div>
      </section>

      {/* リスク確認状態 */}
      {detail.items.length > 0 && (
        <section className="rounded-xl border border-border/60 bg-white px-6 py-6">
          {acknowledgments[workIdNumber] ? (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">✓ リスク確認済み</p>
                  <p className="text-sm text-green-700">
                    {new Date(acknowledgments[workIdNumber].acknowledged_at).toLocaleString('ja-JP')}
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setShowAcknowledgmentDialog(true)}>
                確認済みの詳細を見る
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">⚠️ リスク確認が必要</p>
                <p className="text-sm text-muted-foreground">
                  作業開始前に本日のリスクを確認してください
                </p>
              </div>
              <Button onClick={() => setShowAcknowledgmentDialog(true)}>
                リスク確認を開始
              </Button>
            </div>
          )}
        </section>
      )}

      <RiskActionSection
        items={detail.items}
        manualRisksByItemId={manualRisksByItemId}
        canGenerate={canGenerate}
        canManual={canManual}
        onGenerateRisk={handleGenerateRisk}
        onAddManualRisk={handleAddManualRisk}
        onUpdateManualRisk={handleUpdateManualRisk}
        onDeleteManualRisk={handleDeleteManualRisk}
        onUpdateAiRisk={handleUpdateAiRisk}
        onDeleteAiRisk={handleDeleteAiRisk}
      />

      <section className="rounded-xl border border-border/60 bg-white">
        <div className="border-b border-border/60 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                Related Incidents
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">
                関連インシデント・ヒヤリハット
              </h2>
            </div>
            <Button size="sm" onClick={() => setShowIncidentDialog(true)}>
              追加
            </Button>
          </div>
        </div>
        {relatedIncidents.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              関連するインシデント・ヒヤリハットはありません
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {relatedIncidents.map((incident) => (
              <button
                key={incident.id}
                type="button"
                onClick={() => navigate(`/incidents/${incident.id}`)}
                className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-slate-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {incident.title}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        incident.type === 'incident'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {incident.type === 'incident' ? 'インシデント' : 'ヒヤリハット'}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        incident.status === 'resolved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-50 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {incident.status === 'resolved' ? '解決済' : '対応中'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{incident.date}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-border/60 bg-white">
        <div className="border-b border-border/60 px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Comments
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">コメント</h2>
        </div>
        <div className="p-6 space-y-4">
          <CommentList comments={comments} loading={loadingByWorkId[workIdNumber]} />
          <Separator className="bg-border/40" />
          <CommentForm disabled={!canComment} onSubmit={handleAddComment} />
          {!canComment && (
            <p className="text-xs text-muted-foreground">
              コメント権限がありません。
            </p>
          )}
        </div>
      </section>

      {/* リスク確認ダイアログ */}
      {detail && (
        <RiskAcknowledgmentDialog
          open={showAcknowledgmentDialog}
          onOpenChange={setShowAcknowledgmentDialog}
          work={detail}
          manualRisksByItemId={manualRisksByItemId}
          mode={acknowledgments[workIdNumber] ? 'view' : 'confirm'}
          acknowledgment={acknowledgments[workIdNumber] ?? null}
          loginId={loginId}
          onComplete={() => {
            void fetchAcknowledgment(workIdNumber)
          }}
        />
      )}

      {/* インシデント作成ダイアログ */}
      <IncidentCreateDialog
        open={showIncidentDialog}
        onOpenChange={setShowIncidentDialog}
        workId={workIdNumber}
        workTitle={detail.work.title}
        onSubmit={handleCreateIncident}
      />
    </div>
  )
}
