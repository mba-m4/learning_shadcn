import { useMemo, useState } from 'react'
import type { ManualRisk, RiskDisplay, WorkItemWithRisks } from '@/types/api'

export type DraftRow = {
  key: string
  source: 'manual' | 'ai' | 'new'
  riskId?: number
  content: string
  action: string
}

interface RiskPreviewState {
  open: boolean
  itemName: string
  risk: string
  action: string
}

interface UseRiskActionEditorOptions {
  items: WorkItemWithRisks[]
  manualRisksByItemId: Record<number, ManualRisk[]>
  canManual: boolean
  onAddManualRisk: (
    workItemId: number,
    content: string,
    action?: string | null,
  ) => Promise<boolean>
  onUpdateManualRisk: (
    workItemId: number,
    riskId: number,
    payload: { content?: string | null; action?: string | null },
  ) => Promise<boolean>
  onDeleteManualRisk: (workItemId: number, riskId: number) => Promise<boolean>
  onUpdateAiRisk: (
    workItemId: number,
    riskId: number,
    payload: { content?: string | null; action?: string | null },
  ) => Promise<boolean>
  onDeleteAiRisk: (workItemId: number, riskId: number) => Promise<boolean>
}

const mapToDraftRows = (risks: RiskDisplay[]): DraftRow[] =>
  risks.map((risk) => {
    const idParts = risk.id.split('-')
    const riskId = Number(idParts[1])

    return {
      key: risk.id,
      source: risk.source,
      riskId: Number.isNaN(riskId) ? undefined : riskId,
      content: risk.content,
      action: risk.action ?? '',
    }
  })

export function useRiskActionEditor({
  items,
  manualRisksByItemId,
  canManual,
  onAddManualRisk,
  onUpdateManualRisk,
  onDeleteManualRisk,
  onUpdateAiRisk,
  onDeleteAiRisk,
}: UseRiskActionEditorOptions) {
  const [editingItemId, setEditingItemId] = useState<number | null>(null)
  const [draftRowsByItemId, setDraftRowsByItemId] = useState<Record<number, DraftRow[]>>({})
  const [deletedByItemId, setDeletedByItemId] = useState<Record<number, DraftRow[]>>({})
  const [savingItemId, setSavingItemId] = useState<number | null>(null)
  const [newRowCounter, setNewRowCounter] = useState(0)
  const [preview, setPreview] = useState<RiskPreviewState>({
    open: false,
    itemName: '',
    risk: '',
    action: '',
  })

  const risksByItemId = useMemo(() => {
    return items.reduce<Record<number, RiskDisplay[]>>((accumulator, { item, risks }) => {
      const manual = manualRisksByItemId[item.id] || []
      const mappedManual: RiskDisplay[] = manual.map((risk) => ({
        id: `manual-${risk.id}`,
        content: risk.content,
        source: 'manual',
        timestamp: risk.created_at,
        action: risk.action ?? null,
      }))

      const mappedAi: RiskDisplay[] = risks.map((risk) => ({
        id: `ai-${risk.id}`,
        content: risk.content,
        source: 'ai',
        timestamp: risk.generated_at,
        action: risk.action ?? null,
      }))

      accumulator[item.id] = [...mappedManual, ...mappedAi].sort((a, b) =>
        a.timestamp < b.timestamp ? 1 : -1,
      )
      return accumulator
    }, {})
  }, [items, manualRisksByItemId])

  const startEdit = (itemId: number) => {
    if (!canManual) {
      return
    }

    setEditingItemId(itemId)
    setDraftRowsByItemId((state) => ({
      ...state,
      [itemId]: mapToDraftRows(risksByItemId[itemId] ?? []),
    }))
    setDeletedByItemId((state) => ({ ...state, [itemId]: [] }))
  }

  const cancelEdit = () => {
    setEditingItemId(null)
  }

  const updateDraftRow = (
    itemId: number,
    key: string,
    field: 'content' | 'action',
    value: string,
  ) => {
    setDraftRowsByItemId((state) => ({
      ...state,
      [itemId]: (state[itemId] || []).map((row) =>
        row.key === key ? { ...row, [field]: value } : row,
      ),
    }))
  }

  const addDraftRow = (itemId: number) => {
    const nextKey = `new-${newRowCounter + 1}`
    setNewRowCounter((count) => count + 1)
    setDraftRowsByItemId((state) => ({
      ...state,
      [itemId]: [
        ...(state[itemId] || []),
        { key: nextKey, source: 'new', content: '', action: '' },
      ],
    }))
  }

  const deleteDraftRow = (itemId: number, row: DraftRow) => {
    setDraftRowsByItemId((state) => ({
      ...state,
      [itemId]: (state[itemId] || []).filter((entry) => entry.key !== row.key),
    }))

    if (row.source === 'new') {
      return
    }

    setDeletedByItemId((state) => ({
      ...state,
      [itemId]: [...(state[itemId] || []), row],
    }))
  }

  const saveEdits = async (itemId: number) => {
    const draftRows = draftRowsByItemId[itemId] || []
    const deletedRows = deletedByItemId[itemId] || []

    setSavingItemId(itemId)
    const tasks: Promise<boolean>[] = []

    draftRows.forEach((row) => {
      const content = row.content.trim()
      const action = row.action.trim() || null

      if (row.source === 'new') {
        if (!content) {
          return
        }
        tasks.push(onAddManualRisk(itemId, content, action))
        return
      }

      if (!row.riskId) {
        return
      }

      if (row.source === 'manual') {
        tasks.push(onUpdateManualRisk(itemId, row.riskId, { content, action }))
        return
      }

      tasks.push(onUpdateAiRisk(itemId, row.riskId, { content, action }))
    })

    deletedRows.forEach((row) => {
      if (!row.riskId) {
        return
      }

      if (row.source === 'manual') {
        tasks.push(onDeleteManualRisk(itemId, row.riskId))
        return
      }

      tasks.push(onDeleteAiRisk(itemId, row.riskId))
    })

    const results = await Promise.all(tasks)
    if (results.every(Boolean)) {
      setDraftRowsByItemId((state) => ({ ...state, [itemId]: [] }))
      setDeletedByItemId((state) => ({ ...state, [itemId]: [] }))
      setEditingItemId(null)
    }

    setSavingItemId(null)
  }

  const openPreview = (itemName: string, risk: string, action?: string | null) => {
    setPreview({
      open: true,
      itemName,
      risk,
      action: action?.trim() ? action : '—',
    })
  }

  return {
    addDraftRow,
    cancelEdit,
    deleteDraftRow,
    draftRowsByItemId,
    editingItemId,
    openPreview,
    preview,
    risksByItemId,
    saveEdits,
    savingItemId,
    setPreview,
    startEdit,
    updateDraftRow,
  }
}