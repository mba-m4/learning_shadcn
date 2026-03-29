import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
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
import { getErrorMessage } from '@/shared/api/client'
import {
  createWorkGroupsQueryOptions,
  createWorkMutationOptions,
} from '@/features/works/api/queries'
import type { RiskLevel } from '@/types/api'

interface WorkRiskDraft {
  title: string
  content: string
  severity: '' | RiskLevel
  risk_level: '' | RiskLevel
  action: string
}

interface WorkStepDraft {
  name: string
  description: string
  risks: WorkRiskDraft[]
}

interface WorkDraft {
  title: string
  description: string
  group_id: number | null
  work_date: string
  status: 'draft' | 'confirmed'
  items: WorkStepDraft[]
}

const emptySelectValue = '__none__'
const riskLevelOptions: Array<{ value: RiskLevel; label: string }> = [
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
]

const createEmptyRiskDraft = (): WorkRiskDraft => ({
  title: '',
  content: '',
  severity: '',
  risk_level: '',
  action: '',
})

const createEmptyStepDraft = (): WorkStepDraft => ({
  name: '',
  description: '',
  risks: [],
})

const getToday = () => new Date().toISOString().slice(0, 10)

const createDefaultDraft = (): WorkDraft => ({
  title: '',
  description: '',
  group_id: null,
  work_date: getToday(),
  status: 'draft',
  items: [],
})

export default function WorkCreatePage() {
  const navigate = useNavigate()
  const [draft, setDraft] = useState<WorkDraft>(createDefaultDraft)
  const [stepDraft, setStepDraft] = useState<WorkStepDraft>(createEmptyStepDraft)
  const groupsQuery = useQuery(createWorkGroupsQueryOptions())
  const createWorkMutation = useMutation(createWorkMutationOptions())

  const groups = groupsQuery.data ?? []

  const setDraftField = <K extends keyof WorkDraft>(key: K, value: WorkDraft[K]) => {
    setDraft((state) => ({ ...state, [key]: value }))
  }

  const addDraftItem = (item: WorkStepDraft) => {
    setDraft((state) => ({
      ...state,
      items: [...state.items, item],
    }))
  }

  const removeDraftItem = (index: number) => {
    setDraft((state) => ({
      ...state,
      items: state.items.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  const resetDraft = () => {
    setDraft(createDefaultDraft())
    setStepDraft(createEmptyStepDraft())
  }

  const setStepField = <K extends keyof WorkStepDraft>(key: K, value: WorkStepDraft[K]) => {
    setStepDraft((state) => ({ ...state, [key]: value }))
  }

  const addRiskDraft = () => {
    setStepDraft((state) => ({
      ...state,
      risks: [...state.risks, createEmptyRiskDraft()],
    }))
  }

  const updateRiskDraft = <K extends keyof WorkRiskDraft>(
    index: number,
    key: K,
    value: WorkRiskDraft[K],
  ) => {
    setStepDraft((state) => ({
      ...state,
      risks: state.risks.map((risk, riskIndex) =>
        riskIndex === index ? { ...risk, [key]: value } : risk,
      ),
    }))
  }

  const removeRiskDraft = (index: number) => {
    setStepDraft((state) => ({
      ...state,
      risks: state.risks.filter((_, riskIndex) => riskIndex !== index),
    }))
  }

  const handleAddItem = () => {
    if (!stepDraft.name.trim()) {
      toast.error('作業手順名を入力してください。')
      return
    }

    const risks = stepDraft.risks
      .map((risk) => ({
        title: risk.title.trim(),
        content: risk.content.trim(),
        severity: risk.severity,
        risk_level: risk.risk_level,
        action: risk.action.trim(),
      }))
      .filter((risk) =>
        Boolean(
          risk.title || risk.content || risk.severity || risk.risk_level || risk.action,
        ),
      )

    addDraftItem({
      name: stepDraft.name.trim(),
      description: stepDraft.description.trim(),
      risks,
    })
    setStepDraft(createEmptyStepDraft())
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!draft.title.trim()) {
      toast.error('作業名を入力してください。')
      return
    }
    if (!draft.group_id) {
      toast.error('作業グループを選択してください。')
      return
    }

    try {
      const createdWork = await createWorkMutation.mutateAsync({
        title: draft.title.trim(),
        description: draft.description.trim(),
        group_id: draft.group_id,
        work_date: draft.work_date,
        status: draft.status,
        items: draft.items.map((item) => ({
          name: item.name,
          description: item.description,
          risks: item.risks.map((risk) => ({
            ...(risk.title.trim() ? { title: risk.title.trim() } : {}),
            ...((risk.content.trim() || risk.title.trim())
              ? { content: risk.content.trim() || risk.title.trim() }
              : {}),
            ...(risk.severity ? { severity: risk.severity } : {}),
            ...(risk.risk_level ? { risk_level: risk.risk_level } : {}),
            ...(risk.action.trim() ? { action: risk.action.trim() } : {}),
          })),
        })),
      })

      toast.success('作業を作成しました。')
      resetDraft()
      navigate(`/works/${createdWork.id}`)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="作業作成"
        subtitle="作業情報、手順、必要なリスクアセスメントをまとめて登録します。"
        actions={
          <div className="flex items-center gap-2">
            <span className="holo-tag">Draft</span>
            <span className="holo-tag">{draft.items.length} 手順</span>
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
                  作業名、作業詳細、担当グループを登録します。
                </p>
              </div>
              <span className="holo-tag">New</span>
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="title">作業名</Label>
                <Input
                  id="title"
                  value={draft.title}
                  onChange={(event) => setDraftField('title', event.target.value)}
                  placeholder="配管点検"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">作業詳細</Label>
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
                    onValueChange={(value: 'draft' | 'confirmed') => setDraftField('status', value)}
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
                  <Label>担当グループ</Label>
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
                      {groupsQuery.error && (
                        <div className="px-2 py-1 text-xs text-destructive">
                          {getErrorMessage(groupsQuery.error)}
                        </div>
                      )}
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
                  Procedure
                </p>
                <h2 className="mt-2 text-xl font-semibold">手順</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  作業手順ごとに必要ならリスクアセスメントを追加できます。
                </p>
              </div>
              <span className="holo-tag">{draft.items.length} 手順</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="item-name">作業手順名</Label>
                <Input
                  id="item-name"
                  value={stepDraft.name}
                  onChange={(event) => setStepField('name', event.target.value)}
                  placeholder="バルブ確認"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-description">作業詳細</Label>
                <Input
                  id="item-description"
                  value={stepDraft.description}
                  onChange={(event) => setStepField('description', event.target.value)}
                  placeholder="締結状態の確認"
                />
              </div>
            </div>
            <div className="space-y-3 rounded-xl border border-border/60 bg-background/80 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">リスクアセスメント</p>
                  <p className="text-xs text-muted-foreground">
                    必要な場合だけ追加してください。
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addRiskDraft}>
                  リスクを追加
                </Button>
              </div>
              {stepDraft.risks.length === 0 ? (
                <div className="holo-panel-soft px-4 py-4 text-sm text-muted-foreground">
                  リスクアセスメントはまだ追加されていません。
                </div>
              ) : (
                <div className="space-y-3">
                  {stepDraft.risks.map((risk, index) => (
                    <div key={`step-risk-${index}`} className="rounded-xl border border-border/60 p-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`risk-title-${index}`}>リスク名</Label>
                          <Input
                            id={`risk-title-${index}`}
                            value={risk.title}
                            onChange={(event) => updateRiskDraft(index, 'title', event.target.value)}
                            placeholder="高所からの落下"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`risk-content-${index}`}>リスク詳細</Label>
                          <Input
                            id={`risk-content-${index}`}
                            value={risk.content}
                            onChange={(event) => updateRiskDraft(index, 'content', event.target.value)}
                            placeholder="足場端部での作業が発生"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>重要度</Label>
                          <Select
                            value={risk.severity || emptySelectValue}
                            onValueChange={(value) =>
                              updateRiskDraft(
                                index,
                                'severity',
                                value === emptySelectValue ? '' : (value as RiskLevel),
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="未設定" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={emptySelectValue}>未設定</SelectItem>
                              {riskLevelOptions.map((option) => (
                                <SelectItem key={`severity-${option.value}`} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>リスク度</Label>
                          <Select
                            value={risk.risk_level || emptySelectValue}
                            onValueChange={(value) =>
                              updateRiskDraft(
                                index,
                                'risk_level',
                                value === emptySelectValue ? '' : (value as RiskLevel),
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="未設定" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={emptySelectValue}>未設定</SelectItem>
                              {riskLevelOptions.map((option) => (
                                <SelectItem key={`risk-level-${option.value}`} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        <Label htmlFor={`risk-action-${index}`}>リスク対応</Label>
                        <Textarea
                          id={`risk-action-${index}`}
                          value={risk.action}
                          onChange={(event) => updateRiskDraft(index, 'action', event.target.value)}
                          placeholder="安全帯を装着し、監視員を配置する"
                        />
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRiskDraft(index)}
                        >
                          削除
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button type="button" variant="outline" onClick={handleAddItem}>
              手順を追加
            </Button>
            {draft.items.length === 0 ? (
              <div className="holo-panel-soft px-4 py-4 text-sm text-muted-foreground">
                手順はまだ追加されていません。
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
                      {item.description ? (
                        <p className="text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      ) : null}
                      <div className="mt-2 space-y-1">
                        {item.risks.length === 0 ? (
                          <p className="text-xs text-muted-foreground">
                            リスクアセスメントなし
                          </p>
                        ) : (
                          item.risks.map((risk, riskIndex) => (
                            <div key={`${item.name}-risk-${riskIndex}`} className="text-xs text-muted-foreground">
                              <span className="font-medium text-foreground">
                                {risk.title || `リスク ${riskIndex + 1}`}
                              </span>
                              {risk.content ? ` / ${risk.content}` : ''}
                              {risk.severity ? ` / 重要度:${risk.severity}` : ''}
                              {risk.risk_level ? ` / リスク度:${risk.risk_level}` : ''}
                            </div>
                          ))
                        )}
                      </div>
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
          <Button type="submit" disabled={createWorkMutation.isPending}>
            {createWorkMutation.isPending ? '作成中...' : '作成する'}
          </Button>
          <Button type="button" variant="outline" onClick={() => resetDraft()}>
            リセット
          </Button>
        </div>
      </form>
    </div>
  )
}
