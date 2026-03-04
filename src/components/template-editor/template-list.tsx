/**
 * テンプレート一覧コンポーネント
 * 左サイドバーに表示し、テンプレートの作成・選択・削除を管理
 */

import { useState } from 'react'
import { Plus, FileText, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { Template } from '@/types/template'
import {
  getAllTemplates,
  createTemplate,
  deleteTemplate,
} from '@/lib/storage/templates'

interface TemplateListProps {
  /** 選択中のテンプレートID */
  selectedTemplateId?: string
  /** テンプレート選択時のコールバック */
  onSelectTemplate: (template: Template) => void
}

export function TemplateList({
  selectedTemplateId,
  onSelectTemplate,
}: TemplateListProps) {
  const [templates, setTemplates] = useState<Template[]>(getAllTemplates())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')
  const [newTemplateDescription, setNewTemplateDescription] = useState('')

  const handleCreateTemplate = () => {
    if (!newTemplateName.trim()) return

    const template = createTemplate({
      name: newTemplateName.trim(),
      description: newTemplateDescription.trim() || undefined,
      diagramXml: '', // 空のテンプレート
    })

    setTemplates(getAllTemplates())
    onSelectTemplate(template)
    setIsDialogOpen(false)
    setNewTemplateName('')
    setNewTemplateDescription('')
  }

  const handleDeleteTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()

    if (!confirm('このテンプレートを削除してもよろしいですか？')) return

    deleteTemplate(id)
    setTemplates(getAllTemplates())

    // 削除したテンプレートが選択されていた場合、選択解除
    if (selectedTemplateId === id) {
      // 他のテンプレートがあれば最初のものを選択
      const remaining = getAllTemplates()
      if (remaining.length > 0) {
        onSelectTemplate(remaining[0])
      }
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* ヘッダー */}
      <div className="border-b p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">テンプレート</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="mr-1 size-4" />
                新規作成
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新規テンプレート作成</DialogTitle>
                <DialogDescription>
                  テンプレート名と説明を入力してください
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">テンプレート名 *</Label>
                  <Input
                    id="name"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="例: 請求書テンプレート"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">説明</Label>
                  <Input
                    id="description"
                    value={newTemplateDescription}
                    onChange={(e) => setNewTemplateDescription(e.target.value)}
                    placeholder="例: 顧客向け請求書のテンプレート"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  キャンセル
                </Button>
                <Button onClick={handleCreateTemplate}>作成</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* テンプレート一覧 */}
      <div className="flex-1 overflow-auto">
        {templates.length === 0 ? (
          <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
            テンプレートがありません
            <br />
            「新規作成」から作成してください
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => onSelectTemplate(template)}
                className={cn(
                  'group flex w-full items-start gap-3 rounded-md p-3 text-left transition-colors hover:bg-accent',
                  selectedTemplateId === template.id &&
                    'bg-accent text-accent-foreground'
                )}
              >
                <FileText className="mt-0.5 size-4 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {template.name}
                  </div>
                  {template.description && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {template.description}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(template.updatedAt).toLocaleDateString('ja-JP')}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => handleDeleteTemplate(template.id, e)}
                  className="opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
