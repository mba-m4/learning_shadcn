import { useState } from 'react'
import { UserPlus, Tag, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import type { User } from '@/types/api'

interface IncidentSidebarProps {
  assigneeId?: number | null
  assigneeName?: string | null
  labels: string[]
  users: User[]
  onAssigneeChange: (userId: number | null) => Promise<void>
  onLabelAdd: (label: string) => Promise<void>
  onLabelRemove: (label: string) => Promise<void>
}

const PREDEFINED_LABELS = [
  { name: '緊急', color: 'bg-red-100 text-red-700 border-red-200' },
  { name: '重要', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { name: '安全', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { name: '設備', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { name: '手順', color: 'bg-green-100 text-green-700 border-green-200' },
  { name: '要確認', color: 'bg-purple-100 text-purple-700 border-purple-200' },
]

export function IncidentSidebar({
  assigneeId,
  assigneeName,
  labels,
  users,
  onAssigneeChange,
  onLabelAdd,
  onLabelRemove,
}: IncidentSidebarProps) {
  const [isAddingLabel, setIsAddingLabel] = useState(false)
  const [newLabelInput, setNewLabelInput] = useState('')

  const availableLabels = PREDEFINED_LABELS.filter(
    (label) => !labels.includes(label.name)
  )

  const getLabelColor = (labelName: string) => {
    const predefined = PREDEFINED_LABELS.find((l) => l.name === labelName)
    return predefined?.color || 'bg-slate-100 text-slate-700 border-slate-200'
  }

  const handleAddLabel = async (labelName: string) => {
    if (!labelName.trim() || labels.includes(labelName)) return
    await onLabelAdd(labelName)
    setNewLabelInput('')
    setIsAddingLabel(false)
  }

  return (
    <div className="space-y-6">
      {/* 担当者 */}
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2">
          <UserPlus className="h-4 w-4" />
          担当者
        </div>
        <Select
          value={assigneeId?.toString() || 'none'}
          onValueChange={(value) => {
            const userId = value === 'none' ? null : Number(value)
            void onAssigneeChange(userId)
          }}
        >
          <SelectTrigger className="w-full">
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
        {assigneeName && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
              {assigneeName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-slate-900">{assigneeName}</span>
          </div>
        )}
      </div>

      {/* ラベル */}
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2">
          <Tag className="h-4 w-4" />
          ラベル
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {labels.map((label) => (
            <button
              key={label}
              onClick={() => void onLabelRemove(label)}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold transition-opacity hover:opacity-70 ${getLabelColor(label)}`}
            >
              {label}
              <X className="h-3 w-3" />
            </button>
          ))}
          {labels.length === 0 && (
            <span className="text-sm text-muted-foreground">ラベルなし</span>
          )}
        </div>
        
        {isAddingLabel ? (
          <div className="space-y-2">
            <Input
              value={newLabelInput}
              onChange={(e) => setNewLabelInput(e.target.value)}
              placeholder="新しいラベル"
              className="text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  void handleAddLabel(newLabelInput)
                } else if (e.key === 'Escape') {
                  setIsAddingLabel(false)
                  setNewLabelInput('')
                }
              }}
              autoFocus
            />
            <div className="flex flex-wrap gap-1">
              {availableLabels.map((label) => (
                <button
                  key={label.name}
                  onClick={() => void handleAddLabel(label.name)}
                  className={`rounded-full border px-2 py-0.5 text-xs font-semibold transition-opacity hover:opacity-70 ${label.color}`}
                >
                  {label.name}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => void handleAddLabel(newLabelInput)}
                disabled={!newLabelInput.trim()}
              >
                追加
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsAddingLabel(false)
                  setNewLabelInput('')
                }}
              >
                キャンセル
              </Button>
            </div>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => setIsAddingLabel(true)}
          >
            <Tag className="h-3 w-3 mr-1" />
            ラベルを追加
          </Button>
        )}
      </div>
    </div>
  )
}
