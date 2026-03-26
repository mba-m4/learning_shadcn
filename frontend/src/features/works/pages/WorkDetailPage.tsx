import { useMemo, useState } from 'react'
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import CommentForm from '@/components/comments/CommentForm'
import CommentList from '@/components/comments/CommentList'
import { getErrorMessage } from '@/shared/api/client'
import { queryKeys } from '@/shared/api/queryKeys'
import { IncidentCreateDialog } from '@/features/works/ui/IncidentCreateDialog'
import { RiskAcknowledgmentDialog } from '@/features/works/ui/RiskAcknowledgmentDialog'
import RiskActionSection from '@/features/works/ui/RiskActionSection'
import WorkItemList from '@/features/works/ui/WorkItemList'
import {
  createIncidentMutationOptions,
  createIncidentsQueryOptions,
} from '@/features/incidents/api/queries'
import {
  createWorkAcknowledgmentQueryOptions,
  createWorkDetailQueryOptions,
} from '@/features/works/api/queries'
import {
  createManualRisk,
  deleteManualRisk,
  deleteRiskAssessment,
  generateRisk,
  updateManualRisk,
  updateRiskAssessment,
} from '@/features/works/api/service'
import {
  createAddWorkCommentMutationOptions,
  createManualRisksQueryOptions,
  createWorkCommentsQueryOptions,
} from '@/features/works/api/queries'
import { createManualsQueryOptions } from '@/features/manuals/api/queries'
import { useAuthStore } from '@/stores/authStore'
import type { Comment, ManualRisk, Role } from '@/types/api'

const canCommentRoles: Role[] = ['leader', 'worker']

export default function WorkDetailPage() {
  const { workId } = useParams()
  const workIdNumber = Number(workId)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { currentUser, loginId } = useAuthStore()
  const [showAcknowledgmentDialog, setShowAcknowledgmentDialog] = useState(false)
  const [showIncidentDialog, setShowIncidentDialog] = useState(false)

  const workDetailQuery = useQuery({
    ...createWorkDetailQueryOptions(workIdNumber),
    enabled: Number.isFinite(workIdNumber),
  })
  const commentsQuery = useQuery({
    ...createWorkCommentsQueryOptions(workIdNumber),
    enabled: Number.isFinite(workIdNumber),
  })
  const acknowledgmentQuery = useQuery({
    ...createWorkAcknowledgmentQueryOptions(workIdNumber),
    enabled: Number.isFinite(workIdNumber),
  })
  const incidentsQuery = useQuery(createIncidentsQueryOptions())
  const manualsQuery = useQuery(createManualsQueryOptions())

  const detail = workDetailQuery.data
  const manualRiskQueries = useQueries({
    queries: (detail?.items ?? []).map(({ item }) => ({
      ...createManualRisksQueryOptions(item.id),
      enabled: Boolean(detail),
    })),
  })

  const manualRisksByItemId = useMemo<Record<number, ManualRisk[]>>(() => {
    if (!detail) {
      return {}
    }

    return detail.items.reduce<Record<number, ManualRisk[]>>((accumulator, entry, index) => {
      accumulator[entry.item.id] = (manualRiskQueries[index]?.data ?? []) as ManualRisk[]
      return accumulator
    }, {})
  }, [detail, manualRiskQueries])

  const createCommentMutation = useMutation(
    createAddWorkCommentMutationOptions(workIdNumber),
  )
  const createIncidentMutation = useMutation(createIncidentMutationOptions())
  const addManualRiskMutation = useMutation({
    mutationFn: ({
      itemId,
      content,
      action,
    }: {
      itemId: number
      content: string
      action?: string | null
    }) => createManualRisk(itemId, content, action),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.works.manualRisks(variables.itemId),
      })
      await queryClient.invalidateQueries({
        queryKey: queryKeys.works.acknowledgment(workIdNumber),
      })
    },
  })
  const updateManualRiskMutation = useMutation({
    mutationFn: ({
      riskId,
      payload,
    }: {
      riskId: number
      payload: { content?: string | null; action?: string | null }
    }) => updateManualRisk(riskId, payload),
    onSuccess: async (_data, variables) => {
      const itemId = detail?.items.find(({ item }) =>
        manualRisksByItemId[item.id]?.some((risk) => risk.id === variables.riskId),
      )?.item.id
      if (itemId) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.works.manualRisks(itemId),
        })
      }
      await queryClient.invalidateQueries({
        queryKey: queryKeys.works.acknowledgment(workIdNumber),
      })
    },
  })
  const deleteManualRiskMutation = useMutation({
    mutationFn: ({ riskId }: { riskId: number }) => deleteManualRisk(riskId),
    onSuccess: async (_data, variables) => {
      const itemId = detail?.items.find(({ item }) =>
        manualRisksByItemId[item.id]?.some((risk) => risk.id === variables.riskId),
      )?.item.id
      if (itemId) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.works.manualRisks(itemId),
        })
      }
      await queryClient.invalidateQueries({
        queryKey: queryKeys.works.acknowledgment(workIdNumber),
      })
    },
  })
  const generateRiskMutation = useMutation({
    mutationFn: ({ itemId }: { itemId: number }) => generateRisk(itemId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.works.detail(workIdNumber),
      })
      await queryClient.invalidateQueries({
        queryKey: queryKeys.works.acknowledgment(workIdNumber),
      })
    },
  })
  const updateAiRiskMutation = useMutation({
    mutationFn: ({
      riskId,
      payload,
    }: {
      riskId: number
      payload: { content?: string | null; action?: string | null }
    }) => updateRiskAssessment(riskId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.works.detail(workIdNumber),
      })
      await queryClient.invalidateQueries({
        queryKey: queryKeys.works.acknowledgment(workIdNumber),
      })
    },
  })
  const deleteAiRiskMutation = useMutation({
    mutationFn: ({ riskId }: { riskId: number }) => deleteRiskAssessment(riskId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.works.detail(workIdNumber),
      })
      await queryClient.invalidateQueries({
        queryKey: queryKeys.works.acknowledgment(workIdNumber),
      })
    },
  })

  const relatedIncidents = useMemo(() => {
    return (incidentsQuery.data ?? []).filter((incident) => incident.work_id === workIdNumber)
  }, [incidentsQuery.data, workIdNumber])

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
    const ai = detail.items.flatMap((entry) =>
      entry.risks.map((risk) => ({
        id: `ai-${risk.id}`,
        content: risk.content,
        source: 'AI',
      })),
    )
    const combined = [...manual, ...ai]

    return {
      total: combined.length,
      items: combined.slice(0, 3),
    }
  }, [detail, manualRisksByItemId])

  const relatedManuals = useMemo(() => {
    return [...(manualsQuery.data ?? [])]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 3)
  }, [manualsQuery.data])

  const canGenerate = currentUser?.role === 'leader'
  const canComment = currentUser ? canCommentRoles.includes(currentUser.role) : false
  const canManual = canComment
  const comments: Comment[] = (commentsQuery.data ?? []) as Comment[]
  const acknowledgment = acknowledgmentQuery.data ?? null

  const handleCreateIncident = async (data: {
    title: string
    type: 'incident' | 'near_miss'
    root_cause: string
    corrective_actions: string[]
    work_id?: number
  }) => {
    try {
      await createIncidentMutation.mutateAsync({
        ...data,
        date: new Date().toISOString().split('T')[0],
        status: 'open',
      })
      toast.success('インシデントを登録しました。')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleGenerateRisk = async (itemId: number) => {
    try {
      await generateRiskMutation.mutateAsync({ itemId })
      toast.success('リスクを生成しました。')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleAddComment = async (content: string) => {
    try {
      await createCommentMutation.mutateAsync({ content })
      toast.success('コメントを追加しました。')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleAddManualRisk = async (
    itemId: number,
    content: string,
    action?: string | null,
  ) => {
    try {
      await addManualRiskMutation.mutateAsync({ itemId, content, action })
      toast.success('手入力リスクを追加しました。')
      return true
    } catch (error) {
      toast.error(getErrorMessage(error))
      return false
    }
  }

  const handleUpdateManualRisk = async (
    itemId: number,
    riskId: number,
    payload: { content?: string | null; action?: string | null },
  ) => {
    try {
      await updateManualRiskMutation.mutateAsync({ riskId, payload })
      await queryClient.invalidateQueries({
        queryKey: queryKeys.works.manualRisks(itemId),
      })
      toast.success('リスクを更新しました。')
      return true
    } catch (error) {
      toast.error(getErrorMessage(error))
      return false
    }
  }

  const handleDeleteManualRisk = async (itemId: number, riskId: number) => {
    try {
      await deleteManualRiskMutation.mutateAsync({ riskId })
      await queryClient.invalidateQueries({
        queryKey: queryKeys.works.manualRisks(itemId),
      })
      toast.success('リスクを削除しました。')
      return true
    } catch (error) {
      toast.error(getErrorMessage(error))
      return false
    }
  }

  const handleUpdateAiRisk = async (
    _itemId: number,
    riskId: number,
    payload: { content?: string | null; action?: string | null },
  ) => {
    try {
      await updateAiRiskMutation.mutateAsync({ riskId, payload })
      toast.success('リスクを更新しました。')
      return true
    } catch (error) {
      toast.error(getErrorMessage(error))
      return false
    }
  }

  const handleDeleteAiRisk = async (_itemId: number, riskId: number) => {
    try {
      await deleteAiRiskMutation.mutateAsync({ riskId })
      toast.success('リスクを削除しました。')
      return true
    } catch (error) {
      toast.error(getErrorMessage(error))
      return false
    }
  }

  if (Number.isNaN(workIdNumber)) {
    return <p className="text-sm">作業IDが不正です。</p>
  }

  if (workDetailQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">読み込み中...</p>
  }

  if (workDetailQuery.error) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{getErrorMessage(workDetailQuery.error)}</p>
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          ダッシュボードに戻る
        </Button>
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">作業情報が見つかりませんでした。</p>
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          ダッシュボードに戻る
        </Button>
      </div>
    )
  }

  const statusLabel: Record<'draft' | 'confirmed', string> = {
    draft: '下書き',
    confirmed: '確定',
  }

  const statusTone: Record<'draft' | 'confirmed', string> = {
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

      {detail.items.length > 0 && (
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
        <div className="space-y-4 p-6">
          {commentsQuery.error && (
            <p className="text-sm text-destructive">{getErrorMessage(commentsQuery.error)}</p>
          )}
          <CommentList comments={comments} loading={commentsQuery.isLoading} />
          <Separator className="bg-border/40" />
          <CommentForm disabled={!canComment} onSubmit={handleAddComment} />
          {!canComment && (
            <p className="text-xs text-muted-foreground">
              コメント権限がありません。
            </p>
          )}
        </div>
      </section>

      <RiskAcknowledgmentDialog
        open={showAcknowledgmentDialog}
        onOpenChange={setShowAcknowledgmentDialog}
        work={detail}
        manualRisksByItemId={manualRisksByItemId}
        mode={acknowledgment ? 'view' : 'confirm'}
        acknowledgment={acknowledgment}
        loginId={loginId}
        onComplete={() => {
          void acknowledgmentQuery.refetch()
        }}
      />

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
