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
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2 } from 'lucide-react'
import { useRiskActionEditor } from '@/features/works/model/useRiskActionEditor'
import { RiskActionPreviewDialog } from '@/features/works/ui/RiskActionPreviewDialog'
import type { ManualRisk, WorkItemWithRisks } from '@/types/api'

interface RiskActionSectionProps {
  items: WorkItemWithRisks[]
  manualRisksByItemId: Record<number, ManualRisk[]>
  canGenerate: boolean
  canManual: boolean
  onGenerateRisk: (workItemId: number) => void
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
  const {
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
  } = useRiskActionEditor({
    items,
    manualRisksByItemId,
    canManual,
    onAddManualRisk,
    onUpdateManualRisk,
    onDeleteManualRisk,
    onUpdateAiRisk,
    onDeleteAiRisk,
  })

  const editDisabled = !canManual

  return (
    <section className="rounded-xl border border-border/60 bg-white">
      <div className="border-b border-border/60 px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Risk / Action
        </p>
        <h2 className="mt-2 text-xl font-semibold text-slate-900">リスク / 対応</h2>
      </div>
      <div className="space-y-4 p-6">
        {items.map(({ item }) => {
          const itemRisks = risksByItemId[item.id] ?? []
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
                          <AlertDialogAction onClick={() => onGenerateRisk(item.id)}>
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
                        onClick={() => void saveEdits(item.id)}
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
                      onClick={() => startEdit(item.id)}
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
                  <div className="px-3 py-3 text-sm text-muted-foreground">リスクは未生成です。</div>
                )}

                {!isEditing &&
                  itemRisks.map((risk) => (
                    <div
                      key={risk.id}
                      className="grid cursor-pointer grid-cols-2 gap-3 px-3 py-3 hover:bg-slate-50"
                      onClick={() => openPreview(item.name, risk.content, risk.action)}
                    >
                      <span className="truncate whitespace-nowrap">{risk.content}</span>
                      <span className="truncate whitespace-nowrap text-muted-foreground">
                        {risk.action?.trim() ? risk.action : '—'}
                      </span>
                    </div>
                  ))}

                {isEditing &&
                  (draftRows.length === 0 ? (
                    <div className="px-3 py-3 text-sm text-muted-foreground">リスクは未生成です。</div>
                  ) : (
                    draftRows.map((row) => (
                      <div key={row.key} className="grid grid-cols-2 gap-3 px-3 py-3">
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

      <RiskActionPreviewDialog
        open={preview.open}
        itemName={preview.itemName}
        risk={preview.risk}
        action={preview.action}
        onOpenChange={(open) => setPreview((state) => ({ ...state, open }))}
      />
    </section>
  )
}