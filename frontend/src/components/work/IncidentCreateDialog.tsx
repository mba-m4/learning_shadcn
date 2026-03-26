import { useState, useEffect } from 'react'
import { X, Plus, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useIncidentStore } from '@/stores/incidentStore'

interface IncidentCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workId?: number
  workTitle?: string
  onSubmit: (data: {
    title: string
    type: 'incident' | 'near_miss'
    root_cause: string
    corrective_actions: string[]
    work_id?: number
    assignee_id?: number
    labels: string[]
  }) => Promise<void>
}

const PREDEFINED_LABELS = [
  { name: '緊急', color: 'bg-red-100 text-red-700 border-red-200' },
  { name: '重要', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { name: '安全', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { name: '設備', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { name: '手順', color: 'bg-green-100 text-green-700 border-green-200' },
]

export function IncidentCreateDialog({
  open,
  onOpenChange,
  workId,
  workTitle,
  onSubmit,
}: IncidentCreateDialogProps) {
  const [type, setType] = useState<'incident' | 'near_miss'>('near_miss')
  const [title, setTitle] = useState('')
  const [rootCause, setRootCause] = useState('')
  const [correctiveActions, setCorrectiveActions] = useState<string[]>([''])
  const [assigneeId, setAssigneeId] = useState<number | undefined>()
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { users, fetchUsers } = useIncidentStore()

  useEffect(() => {
    if (open) {
      void fetchUsers()
    }
  }, [open, fetchUsers])

  const handleAddAction = () => {
    setCorrectiveActions([...correctiveActions, ''])
  }

  const handleRemoveAction = (index: number) => {
    setCorrectiveActions(correctiveActions.filter((_, i) => i !== index))
  }

  const handleActionChange = (index: number, value: string) => {
    const updated = [...correctiveActions]
    updated[index] = value
    setCorrectiveActions(updated)
  }

  const handleLabelToggle = (label: string) => {
    setSelectedLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    )
  }

  const handleSubmit = async () => {
    if (!title.trim() || !rootCause.trim()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        title: title.trim(),
        type,
        root_cause: rootCause.trim(),
        corrective_actions: correctiveActions.filter((action) => action.trim()),
        work_id: workId,
        assignee_id: assigneeId,
        labels: selectedLabels,
      })
      // リセット
      setTitle('')
      setRootCause('')
      setCorrectiveActions([''])
      setType('near_miss')
      setAssigneeId(undefined)
      setSelectedLabels([])
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>インシデント・ヒヤリハット登録</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {workTitle && (
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">関連作業</p>
              <p className="text-sm font-medium">{workTitle}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">種別</Label>
              <Select value={type} onValueChange={(value: 'incident' | 'near_miss') => setType(value)}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="near_miss">ヒヤリハット</SelectItem>
                  <SelectItem value="incident">インシデント</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee">担当者</Label>
              <Select
                value={assigneeId?.toString() || 'none'}
                onValueChange={(value) => setAssigneeId(value === 'none' ? undefined : Number(value))}
              >
                <SelectTrigger id="assignee">
                  <SelectValue placeholder="担当者を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <span className="text-muted-foreground">未割り当て</span>
                  </SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">件名</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="インシデントの件名を入力"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="root_cause">原因・状況</Label>
            <Textarea
              id="root_cause"
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              placeholder="発生した状況や根本原因を入力"
              className="min-h-[120px]"
            />
          </div>

          <div className="space-y-2">
            <Label>
              <Tag className="h-3 w-3 inline mr-1" />
              ラベル
            </Label>
            <div className="flex flex-wrap gap-2">
              {PREDEFINED_LABELS.map((label) => (
                <button
                  key={label.name}
                  type="button"
                  onClick={() => handleLabelToggle(label.name)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition-opacity ${
                    selectedLabels.includes(label.name)
                      ? label.color
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {label.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>是正措置（オプション）</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAddAction}
              >
                <Plus className="h-4 w-4 mr-1" />
                追加
              </Button>
            </div>
            <div className="space-y-2">
              {correctiveActions.map((action, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={action}
                    onChange={(e) => handleActionChange(index, e.target.value)}
                    placeholder={`是正措置 ${index + 1}`}
                  />
                  {correctiveActions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAction(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!title.trim() || !rootCause.trim() || isSubmitting}
            >
              {isSubmitting ? '登録中...' : '登録'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
