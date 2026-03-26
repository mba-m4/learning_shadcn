import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import PageHeader from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getErrorMessage } from '@/lib/api/client'
import {
  createIncidentMutationOptions,
  createIncidentsQueryOptions,
  createUsersQueryOptions,
} from '@/lib/api/queries/incidents'
import { IncidentCreateDialog } from '@/components/work/IncidentCreateDialog'

export default function IncidentManagementPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'resolved'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'incident' | 'near_miss'>('all')
  const [query, setQuery] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [assigneeFilter, setAssigneeFilter] = useState<'all' | 'unassigned' | string>('all')
  const [labelFilter, setLabelFilter] = useState('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const incidentsQuery = useQuery(createIncidentsQueryOptions())
  const usersQuery = useQuery(createUsersQueryOptions())
  const createIncidentMutation = useMutation(createIncidentMutationOptions())

  const incidents = incidentsQuery.data ?? []
  const users = usersQuery.data ?? []
  const error = incidentsQuery.error ?? usersQuery.error

  const availableLabels = useMemo(() => {
    const labels = new Set<string>()
    incidents.forEach((incident) => {
      incident.labels?.forEach((label) => labels.add(label))
    })
    return Array.from(labels)
  }, [incidents])

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const matchesStatus =
        statusFilter === 'all' ? true : incident.status === statusFilter
      const matchesType = typeFilter === 'all' ? true : incident.type === typeFilter
      const matchesQuery =
        query.trim().length === 0
          ? true
          : [incident.title, incident.root_cause, incident.work_title]
              .filter(Boolean)
              .some((value) =>
                value!.toLowerCase().includes(query.trim().toLowerCase()),
              )
      const matchesFrom = fromDate ? incident.date >= fromDate : true
      const matchesTo = toDate ? incident.date <= toDate : true
      const matchesAssignee =
        assigneeFilter === 'all'
          ? true
          : assigneeFilter === 'unassigned'
            ? !incident.assignee_id
            : incident.assignee_id === Number(assigneeFilter)
      const matchesLabel =
        labelFilter === 'all' ? true : incident.labels?.includes(labelFilter)

      return (
        matchesStatus &&
        matchesType &&
        matchesQuery &&
        matchesFrom &&
        matchesTo &&
        matchesAssignee &&
        matchesLabel
      )
    })
  }, [
    incidents,
    statusFilter,
    typeFilter,
    query,
    fromDate,
    toDate,
    assigneeFilter,
    labelFilter,
  ])

  const handleCreateIncident = async (data: {
    title: string
    type: 'incident' | 'near_miss'
    root_cause: string
    corrective_actions: string[]
    work_id?: number
  }) => {
    try {
      await createIncidentMutation.mutateAsync({
        ...data,
        date: new Date().toISOString().split('T')[0],
        status: 'open',
      })
      toast.success('インシデントを登録しました。')
      setShowCreateDialog(false)
    } catch (mutationError) {
      toast.error(getErrorMessage(mutationError))
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Incident Management"
        subtitle="事故情報と是正措置を管理します。"
      />
      <div className="rounded-xl border border-border/60 bg-white">
        <div className="border-b border-border/60 px-6 py-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            Incidents
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="relative w-full max-w-xs">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="タイトル・原因・作業名で検索"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">種別:</span>
              {(['all', 'incident', 'near_miss'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTypeFilter(type)}
                  className={`rounded-full border border-border/60 px-2 py-1 text-xs ${
                    typeFilter === type
                      ? 'bg-slate-900 text-white'
                      : 'text-muted-foreground'
                  }`}
                >
                  {type === 'all'
                    ? '全て'
                    : type === 'incident'
                      ? 'インシデント'
                      : 'ヒヤリハット'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">状態:</span>
              {(['all', 'open', 'resolved'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-full border border-border/60 px-2 py-1 text-xs ${
                    statusFilter === status
                      ? 'bg-slate-900 text-white'
                      : 'text-muted-foreground'
                  }`}
                >
                  {status === 'all' ? '全て' : status === 'open' ? '対応中' : '解決済'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">期間:</span>
              <Input
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="h-8 w-[140px]"
              />
              <span className="text-xs text-muted-foreground">〜</span>
              <Input
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="h-8 w-[140px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">担当:</span>
              <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全て</SelectItem>
                  <SelectItem value="unassigned">未割当</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">ラベル:</span>
              <Select value={labelFilter} onValueChange={setLabelFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全て</SelectItem>
                  {availableLabels.map((label) => (
                    <SelectItem key={label} value={label}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="ml-auto">
              <Button size="sm" onClick={() => setShowCreateDialog(true)}>
                新規登録
              </Button>
            </div>
          </div>
        </div>
        <div className="divide-y">
          {error && (
            <div className="px-6 py-4 text-sm text-red-700">
              {getErrorMessage(error)}
            </div>
          )}
          {filteredIncidents.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                {incidentsQuery.isLoading || usersQuery.isLoading
                  ? '読み込み中...'
                  : '該当するインシデントはありません'}
              </p>
            </div>
          ) : (
            filteredIncidents.map((incident) => (
              <button
                key={incident.id}
                type="button"
                onClick={() => navigate(`/incidents/${incident.id}`)}
                className="flex w-full flex-wrap items-center justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-slate-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{incident.title}</p>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
                        incident.type === 'incident'
                          ? 'border-red-200 bg-red-50 text-red-700'
                          : 'border-amber-200 bg-amber-50 text-amber-700'
                      }`}
                    >
                      {incident.type === 'incident' ? 'インシデント' : 'ヒヤリハット'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{incident.date}</p>
                  {incident.work_title && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      関連作業: {incident.work_title}
                    </p>
                  )}
                </div>
                <span
                  className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
                    incident.status === 'resolved'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  {incident.status === 'resolved' ? '解決済' : '対応中'}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      <IncidentCreateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateIncident}
      />
    </div>
  )
}