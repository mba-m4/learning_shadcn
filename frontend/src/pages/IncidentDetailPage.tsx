import { useEffect, useMemo } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { IncidentTimeline } from '@/components/incident/IncidentTimeline'
import { IncidentSidebar } from '@/components/incident/IncidentSidebar'
import { useIncidentStore } from '@/stores/incidentStore'

export default function IncidentDetailPage() {
  const { incidentId } = useParams()
  const incidentIdNumber = Number(incidentId)
  const navigate = useNavigate()
  const {
    incidents,
    comments,
    activities,
    users,
    fetchIncident,
    updateStatus,
    fetchComments,
    fetchActivities,
    fetchUsers,
    addComment,
    updateAssignment,
    addLabel,
    removeLabel,
  } = useIncidentStore()
  
  const incident = useMemo(
    () => incidents.find((item) => item.id === incidentIdNumber),
    [incidentIdNumber, incidents],
  )

  const incidentComments = comments[incidentIdNumber] || []
  const incidentActivities = activities[incidentIdNumber] || []

  useEffect(() => {
    if (Number.isNaN(incidentIdNumber)) {
      return
    }
    void fetchIncident(incidentIdNumber)
    void fetchComments(incidentIdNumber)
    void fetchActivities(incidentIdNumber)
    void fetchUsers()
  }, [fetchIncident, fetchComments, fetchActivities, fetchUsers, incidentIdNumber])

  const getLabelColor = (label: string) => {
    const labelColors: Record<string, string> = {
      '緊急': 'bg-red-100 text-red-700 border-red-200',
      '重要': 'bg-orange-100 text-orange-700 border-orange-200',
      '安全': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      '設備': 'bg-blue-100 text-blue-700 border-blue-200',
      '手順': 'bg-green-100 text-green-700 border-green-200',
      '要確認': 'bg-purple-100 text-purple-700 border-purple-200',
    }
    return labelColors[label] || 'bg-slate-100 text-slate-700 border-slate-200'
  }

  const handleAddComment = async (content: string) => {
    const result = await addComment(incidentIdNumber, content)
    if (result) {
      toast.success('コメントを追加しました')
    } else {
      toast.error('コメントの追加に失敗しました')
    }
  }

  const handleAssigneeChange = async (userId: number | null) => {
    const result = await updateAssignment(incidentIdNumber, userId)
    if (result) {
      toast.success('担当者を更新しました')
    } else {
      toast.error('担当者の更新に失敗しました')
    }
  }

  const handleLabelAdd = async (label: string) => {
    const result = await addLabel(incidentIdNumber, label)
    if (result) {
      toast.success(`ラベル "${label}" を追加しました`)
    } else {
      toast.error('ラベルの追加に失敗しました')
    }
  }

  const handleLabelRemove = async (label: string) => {
    const result = await removeLabel(incidentIdNumber, label)
    if (result) {
      toast.success(`ラベル "${label}" を削除しました`)
    } else {
      toast.error('ラベルの削除に失敗しました')
    }
  }

  const handleStatusToggle = async () => {
    if (!incident) return
    const newStatus = incident.status === 'open' ? 'resolved' : 'open'
    const result = await updateStatus(incident.id, newStatus)
    if (result) {
      toast.success(`ステータスを ${newStatus === 'resolved' ? '解決済' : '対応中'} に更新しました`)
    } else {
      toast.error('ステータスの更新に失敗しました')
    }
  }

  if (!incident) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">インシデントが見つかりません。</p>
        <Button variant="outline" onClick={() => navigate('/incidents')}>
          一覧へ戻る
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/incidents')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          一覧に戻る
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* メインコンテンツ */}
        <div className="space-y-6">
          {/* タイトルとステータス */}
          <div className="rounded-xl border border-border/60 bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      incident.type === 'incident'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {incident.type === 'incident' ? 'インシデント' : 'ヒヤリハット'}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      incident.status === 'resolved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-50 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {incident.status === 'resolved' ? '解決済' : '対応中'}
                  </span>
                </div>
                <h1 className="text-2xl font-semibold text-slate-900">
                  {incident.title}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  {incident.date} に発生
                </p>
                {incident.work_title && incident.work_id && (
                  <Link
                    to={`/works/${incident.work_id}`}
                    className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                  >
                    関連作業: {incident.work_title}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>
              <Button
                onClick={handleStatusToggle}
                variant={incident.status === 'resolved' ? 'outline' : 'default'}
              >
                {incident.status === 'resolved' ? '再オープン' : '解決済みにする'}
              </Button>
            </div>

            {/* ラベル表示 */}
            {incident.labels && incident.labels.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {incident.labels.map((label) => (
                  <span
                    key={label}
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${getLabelColor(label)}`}
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 原因・状況 */}
          <div className="rounded-xl border border-border/60 bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground mb-3">
              原因・状況
            </h2>
            <p className="text-sm text-slate-900 whitespace-pre-wrap">
              {incident.root_cause}
            </p>
          </div>

          {/* 是正措置 */}
          {incident.corrective_actions.length > 0 && (
            <div className="rounded-xl border border-border/60 bg-white p-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground mb-3">
                是正措置
              </h2>
              <ul className="space-y-2">
                {incident.corrective_actions.map((action, index) => (
                  <li key={index} className="flex gap-2 text-sm text-slate-900">
                    <span className="text-muted-foreground">{index + 1}.</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* タイムライン */}
          <div className="rounded-xl border border-border/60 bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground mb-4">
              アクティビティ
            </h2>
            <IncidentTimeline
              activities={incidentActivities}
              comments={incidentComments}
              onAddComment={handleAddComment}
            />
          </div>
        </div>

        {/* サイドバー */}
        <div className="rounded-xl border border-border/60 bg-white p-6">
          <IncidentSidebar
            assigneeId={incident.assignee_id ?? null}
            assigneeName={incident.assignee_name ?? null}
            labels={incident.labels ?? []}
            users={users}
            onAssigneeChange={handleAssigneeChange}
            onLabelAdd={handleLabelAdd}
            onLabelRemove={handleLabelRemove}
          />
        </div>
      </div>
    </div>
  )
}
