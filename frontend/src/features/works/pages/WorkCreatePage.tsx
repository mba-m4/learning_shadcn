import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import PageHeader from '@/components/layout/PageHeader'
import { addWorkItem } from '@/features/works/api/service'
import { useWorkContext } from '@/stores/workContext'

export default function WorkCreatePage() {
  const navigate = useNavigate()
  const { groups, draft, fetchGroups, initializeDraft, setDraftField, addDraftItem, removeDraftItem, createWork, resetDraft } =
    useWorkContext()
  const [itemName, setItemName] = useState('')
  const [itemDescription, setItemDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    void fetchGroups()
    initializeDraft()
  }, [fetchGroups, initializeDraft])

  if (!draft) {
    return <p>読み込み中...</p>
  }

  const handleAddItem = () => {
    if (!itemName.trim() || !itemDescription.trim()) {
      return
    }
    addDraftItem(itemName.trim(), itemDescription.trim())
    setItemName('')
    setItemDescription('')
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!draft.title.trim() || !draft.description.trim()) {
      toast.error('タイトルと説明を入力してください。')
      return
    }
    if (!draft.group_id) {
      toast.error('作業グループを選択してください。')
      return
    }

    setSubmitting(true)
    try {
      const createdWork = await createWork({
        title: draft.title.trim(),
        description: draft.description.trim(),
        group_id: draft.group_id,
        work_date: draft.work_date,
        status: draft.status,
      })

      if (draft.items.length > 0) {
        await Promise.all(
          draft.items.map((item) => addWorkItem(createdWork.id, item)),
        )
      }

      toast.success('作業を作成しました。')
      navigate(`/works/${createdWork.id}`)
    } catch (error) {
      toast.error('作業の作成に失敗しました。')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="作業作成"
        subtitle="作業の基本情報と作業項目を登録します。"
        actions={
          <div className="flex items-center gap-2">
            <span className="holo-tag">Draft</span>
            <span className="holo-tag">{draft.items.length} items</span>
          </div>
        }
      />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <section className="holo-panel space-y-5 px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">
                  Work Profile
                </p>
                <h2 className="mt-2 text-xl font-semibold">作業情報</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  リスク評価に必要な基礎情報を登録します。
                </p>
              </div>
              <span className="holo-tag">New</span>
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="title">タイトル</Label>
                <Input
                  id="title"
                  value={draft.title}
                  onChange={(event) => setDraftField('title', event.target.value)}
                  placeholder="配管点検"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">説明</Label>
                <Textarea
                  id="description"
                  value={draft.description}
                  onChange={(event) =>
                    setDraftField('description', event.target.value)
                  }
                  placeholder="配管の目視点検"
                />
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="work-date">作業日</Label>
                  <Input
                    id="work-date"
                    type="date"
                    value={draft.work_date}
                    onChange={(event) =>
                      setDraftField('work_date', event.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>ステータス</Label>
                  <Select
                    value={draft.status}
                    onValueChange={(value: any) => setDraftField('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="ステータス" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">下書き</SelectItem>
                      <SelectItem value="confirmed">確定</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>作業グループ</Label>
                  <Select
                    value={draft.group_id ? String(draft.group_id) : ''}
                    onValueChange={(value) =>
                      setDraftField('group_id', Number(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="グループを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={String(group.id)}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </section>
          <section className="holo-panel space-y-5 px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">
                  Checklist
                </p>
                <h2 className="mt-2 text-xl font-semibold">作業項目</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  作業前に確認する項目を追加します。
                </p>
              </div>
              <span className="holo-tag">{draft.items.length} items</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="item-name">項目名</Label>
                <Input
                  id="item-name"
                  value={itemName}
                  onChange={(event) => setItemName(event.target.value)}
                  placeholder="バルブ確認"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-description">項目説明</Label>
                <Input
                  id="item-description"
                  value={itemDescription}
                  onChange={(event) => setItemDescription(event.target.value)}
                  placeholder="締結状態の確認"
                />
              </div>
            </div>
            <Button type="button" variant="outline" onClick={handleAddItem}>
              項目を追加
            </Button>
            {draft.items.length === 0 ? (
              <div className="holo-panel-soft px-4 py-4 text-sm text-muted-foreground">
                作業項目はまだ追加されていません。
              </div>
            ) : (
              <div className="space-y-2">
                {draft.items.map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="holo-panel-soft flex items-start justify-between gap-4 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDraftItem(index)}
                    >
                      削除
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? '作成中...' : '作成する'}
          </Button>
          <Button type="button" variant="outline" onClick={() => resetDraft()}>
            リセット
          </Button>
        </div>
      </form>
    </div>
  )
}
