import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryClient } from '@/shared/api/queryClient'
import { queryKeys } from '@/shared/api/queryKeys'
import { getErrorMessage } from '@/shared/api/client'
import { createIncidentMutationOptions } from '@/features/incidents/api/queries'
import {
  createAddWorkCommentMutationOptions,
  createDeleteAiRiskMutationOptions,
  createDeleteManualRiskForItemMutationOptions,
  createGenerateRiskForItemMutationOptions,
  createManualRiskForItemMutationOptions,
  createUpdateAiRiskMutationOptions,
  createUpdateManualRiskForItemMutationOptions,
  createWorkDetailPageQueryOptions,
} from '@/features/works/api/queries'
import { useAuthStore } from '@/stores/authStore'
import type { Role } from '@/types/api'

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
  const detailPageQuery = useQuery({
    ...createWorkDetailPageQueryOptions(workIdNumber),
    enabled: Number.isFinite(workIdNumber),
  })

  const detail = detailPageQuery.data?.work ?? null
  const comments = detailPageQuery.data?.comments ?? []
  const acknowledgment = detailPageQuery.data?.acknowledgment ?? null
  const manualRisksByItemId = detailPageQuery.data?.manual_risks_by_item_id ?? {}

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

  const relatedIncidents = detailPageQuery.data?.related_incidents ?? []
  const relatedIncidentsSorted = [...relatedIncidents].sort((a, b) => b.date.localeCompare(a.date))

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

  const relatedManuals = detailPageQuery.data?.related_manuals ?? []

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
      await queryClient.invalidateQueries({ queryKey: queryKeys.works.detailPage(workIdNumber) })
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
    commentsQuery: detailPageQuery,
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
    refetchAcknowledgment: detailPageQuery.refetch,
    setShowAcknowledgmentDialog,
    setShowIncidentDialog,
    showAcknowledgmentDialog,
    showIncidentDialog,
    workDetailQuery: detailPageQuery,
    workScene: detailPageQuery.data?.scene ?? null,
    workSceneQuery: detailPageQuery,
  }
}