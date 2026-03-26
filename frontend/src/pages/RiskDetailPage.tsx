import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { AlertTriangle, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import PageHeader from '@/components/layout/PageHeader'
import { useRiskRegistryStore } from '@/stores/riskRegistryStore'

type RiskSeverity = 'low' | 'medium' | 'high'

const getSeverityColor = (severity: RiskSeverity) => {
  switch (severity) {
    case 'high':
      return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-600', button: 'bg-red-600 hover:bg-red-700' }
    case 'medium':
      return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', icon: 'text-yellow-600', button: 'bg-yellow-600 hover:bg-yellow-700' }
    case 'low':
      return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'text-green-600', button: 'bg-green-600 hover:bg-green-700' }
  }
}

const getStatusColor = (status: 'open' | 'in_review' | 'closed') => {
  switch (status) {
    case 'open':
      return 'bg-slate-100 text-slate-900'
    case 'in_review':
      return 'bg-blue-100 text-blue-900'
    case 'closed':
      return 'bg-green-100 text-green-900'
  }
}

export default function RiskDetailPage() {
  const { riskId } = useParams()
  const riskIdNumber = Number(riskId)
  const navigate = useNavigate()
  const { risks, fetchRisk, updateSeverity, updateStatus, addAction } = useRiskRegistryStore()
  const risk = useMemo(
    () => risks.find((item) => item.id === riskIdNumber),
    [riskIdNumber, risks],
  )
  const [newAction, setNewAction] = useState('')

  useEffect(() => {
    if (Number.isNaN(riskIdNumber)) {
      return
    }
    void fetchRisk(riskIdNumber)
  }, [fetchRisk, riskIdNumber])

  if (!risk) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">リスクが見つかりません。</p>
        <Button variant="outline" onClick={() => navigate('/risk')}>
          一覧へ戻る
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Risk Detail"
        subtitle="リスクの詳細と是正措置を確認します。"
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/risk')}>
            一覧へ戻る
          </Button>
        }
      />
      <section className={`rounded-xl border-2 p-6 ${getSeverityColor(risk.severity).bg}`} style={{ borderColor: getSeverityColor(risk.severity).border.split('-').slice(1).join('-') }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {risk.severity === 'high' && <AlertTriangle className={`h-6 w-6 ${getSeverityColor(risk.severity).icon}`} />}
              {risk.severity === 'medium' && <AlertCircle className={`h-6 w-6 ${getSeverityColor(risk.severity).icon}`} />}
              {risk.severity === 'low' && <Clock className={`h-6 w-6 ${getSeverityColor(risk.severity).icon}`} />}
              <h2 className="text-2xl font-semibold text-slate-900">{risk.title}</h2>
            </div>
            <p className={`mt-2 text-sm ${getSeverityColor(risk.severity).text}`}>{risk.summary}</p>
          </div>
          <div className={`rounded-lg px-3 py-1 text-sm font-semibold ${getSeverityColor(risk.severity).text} ${getSeverityColor(risk.severity).bg}`}>
            {risk.severity === 'high' ? '高リスク' : risk.severity === 'medium' ? '中リスク' : '低リスク'}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {(['low', 'medium', 'high'] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => {
                  updateSeverity(risk.id, level).then((result) => {
                    if (result) {
                      toast.success(`重要度を ${level} に更新しました。`)
                    } else {
                      toast.error('重要度の更新に失敗しました。')
                    }
                  })
                }}
                className={`rounded-full px-2 py-1 font-medium transition-all ${
                  risk.severity === level
                    ? `${getSeverityColor(level).button} text-white`
                    : `border border-border/40 text-muted-foreground bg-white hover:bg-slate-50`
                }`}
              >
                {level === 'high' ? '高' : level === 'medium' ? '中' : '低'}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(['open', 'in_review', 'closed'] as const).map((state) => (
              <button
                key={state}
                type="button"
                onClick={() => {
                  updateStatus(risk.id, state).then((result) => {
                    if (result) {
                      toast.success(`ステータスを ${state} に更新しました。`)
                    } else {
                      toast.error('ステータスの更新に失敗しました。')
                    }
                  })
                }}
                className={`rounded-full px-2 py-1 font-medium transition-all ${
                  risk.status === state
                    ? `${getStatusColor(state)} border border-border`
                    : `border border-border/40 text-muted-foreground bg-white hover:bg-slate-50`
                }`}
              >
                {state === 'open' ? '未対応' : state === 'in_review' ? '検討中' : '完了'}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="rounded-full border border-border/40 px-2 py-1 text-xs text-muted-foreground bg-white hover:bg-slate-50 font-medium transition-all"
            onClick={() => {
              if (risk.work_id) {
                navigate(`/works/${risk.work_id}`)
              }
            }}
          >
            関連作業: {risk.work_title ?? '未設定'}
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-border/60 bg-white">
        <div className="border-b border-border/60 px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Corrective Actions
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">是正措置</p>
        </div>
        <div className="divide-y">
          {risk.actions.length === 0 && (
            <div className="px-6 py-4 text-sm text-muted-foreground">
              是正措置はまだ追加されていません。
            </div>
          )}
          {risk.actions.map((action) => (
            <div key={action} className="flex items-start gap-3 px-6 py-4">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-900">{action}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-border/60 px-6 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={newAction}
              onChange={(event) => setNewAction(event.target.value)}
              placeholder="是正措置を追加"
              className="w-full max-w-sm"
            />
            <Button
              size="sm"
              onClick={() => {
                if (!newAction.trim()) return
                addAction(risk.id, newAction.trim()).then((result) => {
                  if (result) {
                    setNewAction('')
                    toast.success('是正措置を追加しました。')
                  } else {
                    toast.error('是正措置の追加に失敗しました。')
                  }
                })
              }}
            >
              追加
            </Button>
          </div>
        </div>
      </section>

      {/* Change Timeline */}
      <section className="rounded-xl border border-border/60 bg-white p-6">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            History
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">変更履歴</p>
        </div>
        <div className="space-y-4">
          {/* Timeline item: Risk created */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="h-3 w-3 rounded-full bg-slate-400 mt-1" />
              <div className="w-0.5 h-12 bg-gradient-to-b from-slate-400 to-transparent" />
            </div>
            <div className="pb-4">
              <p className="text-sm font-semibold text-slate-900">リスクが登録されました</p>
              <p className="text-xs text-muted-foreground mt-1">登録日時: {risk.title}</p>
            </div>
          </div>

          {/* Timeline item: Current severity */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`h-3 w-3 rounded-full ${
                risk.severity === 'high' ? 'bg-red-500' : 
                risk.severity === 'medium' ? 'bg-yellow-500' : 
                'bg-green-500'
              } mt-1`} />
              <div className="w-0.5 h-12 bg-gradient-to-b from-current to-transparent" />
            </div>
            <div className="pb-4">
              <p className="text-sm font-semibold text-slate-900">重要度: {risk.severity === 'high' ? '高リスク' : risk.severity === 'medium' ? '中リスク' : '低リスク'}</p>
              <p className="text-xs text-muted-foreground mt-1">現在の状態</p>
            </div>
          </div>

          {/* Timeline item: Current status */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`h-3 w-3 rounded-full ${
                risk.status === 'open' ? 'bg-slate-400' : 
                risk.status === 'in_review' ? 'bg-blue-500' : 
                'bg-green-500'
              } mt-1`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">ステータス: {risk.status === 'open' ? '未対応' : risk.status === 'in_review' ? '検討中' : '完了'}</p>
              <p className="text-xs text-muted-foreground mt-1">現在の状態</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
