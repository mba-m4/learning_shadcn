import { useCallback, useState } from 'react'
import { useMutation, useQueries, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/api/client'
import {
  createIncidentMutationOptions,
  createIncidentsQueryOptions,
} from '@/features/incidents/api/queries'
import { createManualsQueryOptions } from '@/features/manuals/api/queries'
import {
  createAddWorkCommentMutationOptions,
  createDeleteManualRiskForItemMutationOptions,
  createGenerateRiskForItemMutationOptions,
  createManualRisksQueryOptions,
  createManualRiskForItemMutationOptions,
  createWorkAcknowledgmentQueryOptions,
  createWorkCommentsQueryOptions,
  createWorkDetailQueryOptions,
  createWorkSceneQueryOptions,
  createDeleteAiRiskMutationOptions,
  createUpdateManualRiskForItemMutationOptions,
  createUpdateAiRiskMutationOptions,
} from '@/features/works/api/queries'
import { useAuthStore } from '@/stores/authStore'
import type {
  Comment,
  Incident,
  Manual,
  ManualRisk,
  Role,
} from '@/types/api'

const canCommentRoles: Role[] = ['leader', 'worker']

export interface RelatedRiskPreview {
  id: string
  content: string
  source: string
}

export interface WorkIncidentDraft {
  title: string
  type: 'incident' | 'near_miss'
  root_cause: string
  corrective_actions: string[]
  work_id?: number
  assignee_id?: number
  labels: string[]
}

export function useWorkDetailController(workIdNumber: number) {
  const { currentUser, loginId } = useAuthStore()
  const [showAcknowledgmentDialog, setShowAcknowledgmentDialog] = useState(false)
  const [showIncidentDialog, setShowIncidentDialog] = useState(false)
  const selectRelatedIncidents = useCallback(
    (incidents: Incident[]) => {
      const relatedIncidents = incidents.filter((incident) => incident.work_id === workIdNumber)

      return {
        relatedIncidents,
        relatedIncidentsSorted: [...relatedIncidents].sort((a, b) => b.date.localeCompare(a.date)),
      }
    },
    [workIdNumber],
  )
  const selectRecentManuals = useCallback(
    (manuals: Manual[]) =>
      [...manuals]
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 3),
    [],
  )

  const workDetailQuery = useQuery({
    ...createWorkDetailQueryOptions(workIdNumber),
    enabled: Number.isFinite(workIdNumber),
  })
  const commentsQuery = useQuery({
    ...createWorkCommentsQueryOptions(workIdNumber),
    enabled: Number.isFinite(workIdNumber),
  })
  const workSceneQuery = useQuery({
    ...createWorkSceneQueryOptions(workIdNumber),
    enabled: Number.isFinite(workIdNumber),
  })
  const acknowledgmentQuery = useQuery({
    ...createWorkAcknowledgmentQueryOptions(workIdNumber),
    enabled: Number.isFinite(workIdNumber),
  })
  const incidentsQuery = useQuery(
    createIncidentsQueryOptions({
      select: selectRelatedIncidents,
    }),
  )
  const manualsQuery = useQuery(
    createManualsQueryOptions({
      select: selectRecentManuals,
    }),
  )

  const detail = workDetailQuery.data
  const manualRiskQueries = useQueries({
    queries: (detail?.items ?? []).map(({ item }) => ({
      ...createManualRisksQueryOptions(item.id),
      enabled: Boolean(detail),
    })),
  })

  const manualRisksByItemId = detail
    ? detail.items.reduce<Record<number, ManualRisk[]>>((accumulator, entry, index) => {
        accumulator[entry.item.id] = (manualRiskQueries[index]?.data ?? []) as ManualRisk[]
        return accumulator
      }, {})
    : {}

  const comments = (commentsQuery.data ?? []) as Comment[]
  const acknowledgment = acknowledgmentQuery.data ?? null

  const createCommentMutation = useMutation(
    createAddWorkCommentMutationOptions(workIdNumber),
  )
  const createIncidentMutation = useMutation(createIncidentMutationOptions())
  const addManualRiskMutation = useMutation(
    createManualRiskForItemMutationOptions(workIdNumber),
  )
  const updateManualRiskMutation = useMutation(
    createUpdateManualRiskForItemMutationOptions(workIdNumber),
  )
  const deleteManualRiskMutation = useMutation(
    createDeleteManualRiskForItemMutationOptions(workIdNumber),
  )
  const generateRiskMutation = useMutation(
    createGenerateRiskForItemMutationOptions(workIdNumber),
  )
  const updateAiRiskMutation = useMutation(
    createUpdateAiRiskMutationOptions(workIdNumber),
  )
  const deleteAiRiskMutation = useMutation(
    createDeleteAiRiskMutationOptions(workIdNumber),
  )

  const relatedIncidents = incidentsQuery.data?.relatedIncidents ?? []
  const relatedIncidentsSorted = incidentsQuery.data?.relatedIncidentsSorted ?? []

  const relatedRisks = detail
    ? (() => {
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
      })()
    : { total: 0, items: [] as RelatedRiskPreview[] }

  const relatedManuals = manualsQuery.data ?? []

  const canGenerate = currentUser?.role === 'leader'
  const canComment = currentUser ? canCommentRoles.includes(currentUser.role) : false
  const canManual = canComment

  const handleCreateIncident = async (data: WorkIncidentDraft) => {
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
      await updateManualRiskMutation.mutateAsync({ itemId, riskId, payload })
      toast.success('リスクを更新しました。')
      return true
    } catch (error) {
      toast.error(getErrorMessage(error))
      return false
    }
  }

  const handleDeleteManualRisk = async (itemId: number, riskId: number) => {
    try {
      await deleteManualRiskMutation.mutateAsync({ itemId, riskId })
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

  return {
    acknowledgment,
    canComment,
    canGenerate,
    canManual,
    comments,
    commentsQuery,
    detail,
    handleAddComment,
    handleAddManualRisk,
    handleCreateIncident,
    handleDeleteAiRisk,
    handleDeleteManualRisk,
    handleGenerateRisk,
    handleUpdateAiRisk,
    handleUpdateManualRisk,
    loginId,
    manualRisksByItemId,
    relatedIncidents,
    relatedIncidentsSorted,
    relatedManuals,
    relatedRisks,
    refetchAcknowledgment: acknowledgmentQuery.refetch,
    setShowAcknowledgmentDialog,
    setShowIncidentDialog,
    showAcknowledgmentDialog,
    showIncidentDialog,
    workDetailQuery,
    workScene: workSceneQuery.data ?? null,
    workSceneQuery,
  }
}