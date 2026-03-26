import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2 } from 'lucide-react'
import type { ManualRisk, RiskDisplay, WorkItemWithRisks } from '@/types/api'

interface RiskActionSectionProps {
  items: WorkItemWithRisks[]
  manualRisksByItemId: Record<number, ManualRisk[]>
  canGenerate: boolean
  canManual: boolean
  onGenerateRisk: (workItemId: number) => void
  onAddManualRisk: (
    workItemId: number,
    content: string,
    action?: string | null
  ) => Promise<boolean>
  onUpdateManualRisk: (
    workItemId: number,
    riskId: number,
    payload: { content?: string | null; action?: string | null }
  ) => Promise<boolean>
  onDeleteManualRisk: (workItemId: number, riskId: number) => Promise<boolean>
  onUpdateAiRisk: (
    workItemId: number,
    riskId: number,
    payload: { content?: string | null; action?: string | null }
  ) => Promise<boolean>
  onDeleteAiRisk: (workItemId: number, riskId: number) => Promise<boolean>
}

type DraftRow = {
  key: string
  source: 'manual' | 'ai' | 'new'
  riskId?: number
  content: string
  action: string
}

export default function RiskActionSection({
  items,
  manualRisksByItemId,
  canGenerate,
  canManual,
  onGenerateRisk,
  onAddManualRisk,
  onUpdateManualRisk,
  onDeleteManualRisk,
  onUpdateAiRisk,
  onDeleteAiRisk,
}: RiskActionSectionProps) {
  const [editingItemId, setEditingItemId] = useState<number | null>(null)
  const [draftRowsByItemId, setDraftRowsByItemId] = useState<
    Record<number, DraftRow[]>
  >({})
  const [deletedByItemId, setDeletedByItemId] = useState<
    Record<number, DraftRow[]>
  >({})
  const [savingItemId, setSavingItemId] = useState<number | null>(null)
  const [newRowCounter, setNewRowCounter] = useState(0)
  const [preview, setPreview] = useState<{
    open: boolean
    itemName: string
    risk: string
    action: string
  }>({
    open: false,
    itemName: '',
    risk: '',
    action: '',
  })

  const buildRisks = (itemId: number, risks: WorkItemWithRisks['risks']) => {
    const manual = manualRisksByItemId[itemId] || []
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

    return [...mappedManual, ...mappedAi].sort((a, b) =>
      a.timestamp < b.timestamp ? 1 : -1,
    )
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

  const startEdit = (itemId: number, risks: RiskDisplay[]) => {
    if (!canManual) {
      return
    }
    setEditingItemId(itemId)
    setDraftRowsByItemId((state) => ({
      ...state,
      [itemId]: mapToDraftRows(risks),
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
        tasks.push(
          onUpdateManualRisk(itemId, row.riskId, {
            content,
            action,
          }),
        )
        return
      }
      tasks.push(
        onUpdateAiRisk(itemId, row.riskId, {
          content,
          action,
        }),
      )
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
    const success = results.every(Boolean)

    if (success) {
      setDraftRowsByItemId((state) => ({ ...state, [itemId]: [] }))
      setDeletedByItemId((state) => ({ ...state, [itemId]: [] }))
      setEditingItemId(null)
    }

    setSavingItemId(null)
  }

  const editDisabled = !canManual

  return (
    <section className="rounded-xl border border-border/60 bg-white">
      <div className="border-b border-border/60 px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Risk / Action
        </p>
        <h2 className="mt-2 text-xl font-semibold text-slate-900">
          リスク / 対応
        </h2>
      </div>
      <div className="space-y-4 p-6">
        {items.map(({ item, risks }) => {
          const itemRisks = buildRisks(item.id, risks)
          const draftRows = draftRowsByItemId[item.id] || []
          const isEditing = editingItemId === item.id
          const hasEmptyRow = draftRows.some((row) => !row.content.trim())
          const disableEditButton =
            editDisabled ||
            (editingItemId !== null && editingItemId !== item.id) ||
            savingItemId === item.id

          return (
            <div
              key={`risk-action-${item.id}`}
              className="rounded-md border border-border/40 bg-transparent"
            >
              <div className="flex items-center justify-between gap-3 border-b border-border/40 bg-slate-900 px-3 py-2">
                <p className="text-sm font-medium text-white">{item.name}</p>
                <div className="flex items-center gap-2">
                  {canGenerate && !isEditing && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          AIリスク生成
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>リスクを生成しますか？</AlertDialogTitle>
                          <AlertDialogDescription>
                            生成結果を確認してから作業を確定してください。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>キャンセル</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onGenerateRisk(item.id)}
                          >
                            実行する
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  {isEditing ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => saveEdits(item.id)}
                        disabled={savingItemId === item.id || hasEmptyRow}
                      >
                        保存
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        取消
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(item.id, itemRisks)}
                      disabled={disableEditButton}
                    >
                      編集
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 bg-slate-900/90 px-3 py-2 text-xs">
                <span className="text-white">Risk</span>
                <span className="text-white">Action</span>
              </div>
              <div className="divide-y divide-border/40 text-sm">
                {!isEditing && itemRisks.length === 0 && (
                  <div className="px-3 py-3 text-sm text-muted-foreground">
                    リスクは未生成です。
                  </div>
                )}
                {!isEditing &&
                  itemRisks.map((risk) => (
                    <div
                      key={risk.id}
                      className="grid cursor-pointer grid-cols-2 gap-3 px-3 py-3 hover:bg-slate-50"
                      onClick={() =>
                        setPreview({
                          open: true,
                          itemName: item.name,
                          risk: risk.content,
                          action: risk.action?.trim() ? risk.action : '—',
                        })
                      }
                    >
                      <span className="truncate whitespace-nowrap">
                        {risk.content}
                      </span>
                      <span className="truncate whitespace-nowrap text-muted-foreground">
                        {risk.action?.trim() ? risk.action : '—'}
                      </span>
                    </div>
                  ))}
                {isEditing &&
                  (draftRows.length === 0 ? (
                    <div className="px-3 py-3 text-sm text-muted-foreground">
                      リスクは未生成です。
                    </div>
                  ) : (
                    draftRows.map((row) => (
                      <div
                        key={row.key}
                        className="grid grid-cols-2 gap-3 px-3 py-3"
                      >
                        <Textarea
                          value={row.content}
                          onChange={(event) =>
                            updateDraftRow(item.id, row.key, 'content', event.target.value)
                          }
                          rows={2}
                        />
                        <div className="flex items-center gap-2">
                          <Textarea
                            value={row.action}
                            onChange={(event) =>
                              updateDraftRow(item.id, row.key, 'action', event.target.value)
                            }
                            rows={2}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteDraftRow(item.id, row)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ))}
              </div>
              {isEditing && (
                <div className="grid grid-cols-2 gap-3 px-3 py-3">
                  <Button
                    variant="outline"
                    className="col-span-2 w-full justify-center"
                    onClick={() => addDraftRow(item.id)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    行を追加
                  </Button>
                </div>
              )}
              {isEditing && hasEmptyRow && (
                <p className="px-3 pb-3 text-xs text-muted-foreground">
                  Riskは空欄のまま保存できません。
                </p>
              )}
            </div>
          )
        })}
      </div>
      <Dialog
        open={preview.open}
        onOpenChange={(open) =>
          setPreview((state) => ({ ...state, open }))
        }
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Risk / Action</DialogTitle>
            <DialogDescription>{preview.itemName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Risk
              </p>
              <p className="mt-2 whitespace-pre-wrap text-slate-900">
                {preview.risk}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Action
              </p>
              <p className="mt-2 whitespace-pre-wrap text-slate-900">
                {preview.action}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
