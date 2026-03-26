import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, ShieldAlert, Users, Bell, AlertTriangle, Info, CheckCircle, ChevronRight, TrendingUp, BarChart3 } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import PageHeader from '@/components/layout/PageHeader'
import { useWorkStore } from '@/stores/workStore'
import { useSafetyStore } from '@/stores/safetyStore'
import { useIncidentStore } from '@/stores/incidentStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { useRiskRegistryStore } from '@/stores/riskRegistryStore'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'

export default function DashboardPage() {
  const { date, dailyOverview, fetchDailyOverview } = useWorkStore()
  const { acknowledgments, fetchAcknowledgment } = useSafetyStore()
  const { incidents, fetchIncidents } = useIncidentStore()
  const { notifications, fetchNotifications } = useNotificationStore()
  const { risks, fetchRisks } = useRiskRegistryStore()
  const navigate = useNavigate()

  // チャート設定
  const chartConfig = {
    count: {
      label: 'リスク数',
      color: '#ef4444',
    },
  } satisfies ChartConfig

  useEffect(() => {
    void fetchDailyOverview(date)
    void fetchIncidents()
    void fetchNotifications()
    void fetchRisks()
  }, [date, fetchDailyOverview, fetchIncidents, fetchNotifications, fetchRisks])

  useEffect(() => {
    dailyOverview.forEach((overview) => {
      void fetchAcknowledgment(overview.work.id)
    })
  }, [dailyOverview, fetchAcknowledgment])

  const todayWorks = useMemo(() => {
    return dailyOverview.slice(0, 5)
  }, [dailyOverview])

  const recentIncidents = useMemo(() => {
    return incidents.slice(0, 5)
  }, [incidents])

  // 未署名の作業
  const unsignedWorks = useMemo(() => {
    return dailyOverview.filter((overview) => !acknowledgments[overview.work.id])
  }, [dailyOverview, acknowledgments])

  // リスク推移グラフ用データ（過去7日）
  const riskTrendData = useMemo(() => {
    const dates: string[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      dates.push(d.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }))
    }
    
    // 簡易実装: 本来はバックエンドから過去7日のリスク数を取得
    const mockCounts = [3, 5, 4, 7, 6, 8, 4]
    return dates.map((date, idx) => ({
      date,
      count: mockCounts[idx],
    }))
  }, [])

  // 班別完了率ランキング用データ
  const groupRanking = useMemo(() => {
    // 簡易実装: 本来はバックエンドから実データを取得
    const groups = [
      { name: '設備点検', correctionRate: 85, safetyCheckRate: 90 },
      { name: '安全巡視', correctionRate: 78, safetyCheckRate: 88 },
      { name: '清掃作業', correctionRate: 72, safetyCheckRate: 76 },
    ]
    return groups.sort((a, b) => b.correctionRate - a.correctionRate)
  }, [])

  const activeNotifications = useMemo(() => {
    const now = new Date()
    return [...notifications]
      .filter((notification) => {
        if (notification.pinned) {
          return true
        }
        if (!notification.display_until) {
          return true
        }
        return new Date(notification.display_until) >= now
      })
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1
        if (!a.pinned && b.pinned) return 1
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
  }, [notifications])

  const notificationContentRefs = useRef<Record<number, HTMLParagraphElement | null>>({})
  const [isContentTruncated, setIsContentTruncated] = useState<Record<number, boolean>>({})

  useEffect(() => {
    const measure = () => {
      const next: Record<number, boolean> = {}
      activeNotifications.forEach((notification) => {
        const element = notificationContentRefs.current[notification.id]
        if (!element) {
          return
        }
        next[notification.id] = element.scrollHeight > element.clientHeight + 1
      })
      setIsContentTruncated(next)
    }

    const raf = requestAnimationFrame(measure)
    window.addEventListener('resize', measure)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', measure)
    }
  }, [activeNotifications])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <AlertTriangle className="h-4 w-4" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />
      case 'success':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'border-red-200 bg-red-50'
      case 'warning':
        return 'border-orange-200 bg-orange-50'
      case 'success':
        return 'border-emerald-200 bg-emerald-50'
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  const getNotificationTextColor = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'text-red-900'
      case 'warning':
        return 'text-orange-900'
      case 'success':
        return 'text-emerald-900'
      default:
        return 'text-blue-900'
    }
  }

  const getNotificationIconColor = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'text-red-600'
      case 'warning':
        return 'text-orange-600'
      case 'success':
        return 'text-emerald-600'
      default:
        return 'text-blue-600'
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        subtitle="作業とリスクの全体像を一望します。"
      />

      {/* 緊急アラートセクション */}
      <div className="space-y-3">
        {/* Critical Alert: Unsigned Works */}
        {unsignedWorks.length > 0 && (
          <div className="flex gap-4 rounded-lg border-2 border-red-300 bg-red-50 p-4">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">⚠️ 未署名の作業があります</h3>
              <p className="mt-1 text-sm text-red-800">
                本日 {unsignedWorks.length}件の作業の安全確認がまだ完了していません。
              </p>
              <button
                type="button"
                onClick={() => navigate(`/works/${unsignedWorks[0].work.id}`)}
                className="mt-2 inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
              >
                確認が必要な作業を表示
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Warning Alert: High-Risk Items */}
        {useMemo(() => {
          const highRisks = risks.filter((r) => r.severity === 'high')
          return highRisks.length > 0 ? (
            <div className="flex gap-4 rounded-lg border-2 border-yellow-300 bg-yellow-50 p-4">
              <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900">⚠️ 高いリスク評価があります</h3>
                <p className="mt-1 text-sm text-yellow-800">
                  {highRisks.length}件のリスクが「高リスク」と評価されています。早急な対応が必要です。
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/risk')}
                  className="mt-2 inline-flex items-center gap-2 rounded-md bg-yellow-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-yellow-700 transition-colors"
                >
                  リスク台帳を確認
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : null
        }, [risks, navigate])}

        {/* Info Alert: Recent Incidents */}
        {recentIncidents.length > 0 && (
          <div className="flex gap-4 rounded-lg border-2 border-blue-300 bg-blue-50 p-4">
            <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900">ℹ️ 最近の事故・ヒヤリハットが登録されています</h3>
              <p className="mt-1 text-sm text-blue-800">
                {recentIncidents.length}件の報告が確認され�ます。詳細を確認して、今後の対策に活かしてください。
              </p>
              <button
                type="button"
                onClick={() => navigate('/incidents')}
                className="mt-2 inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                事故・ヒヤリハット一覧
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 通知セクション */}
      {activeNotifications.length > 0 && (
        <section className="rounded-xl border border-border/60 bg-white">
          <div className="border-b border-border/60 px-6 py-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              <Bell className="h-4 w-4" />
              Notifications
            </div>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">お知らせ</h2>
          </div>
          <div className="divide-y">
            {activeNotifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() =>
                  navigate(`/notifications/${notification.id}`, {
                    state: { from: '/dashboard' },
                  })
                }
                className={`w-full px-6 py-4 text-left transition-colors hover:bg-slate-50 ${!notification.is_read ? 'bg-slate-50/50' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border ${getNotificationColor(notification.type)}`}
                  >
                    <span className={getNotificationIconColor(notification.type)}>
                      {getNotificationIcon(notification.type)}
                    </span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-4">
                      <h3
                        className={`text-sm font-semibold ${getNotificationTextColor(notification.type)}`}
                      >
                        {notification.title}
                      </h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(notification.created_at).toLocaleDateString('ja-JP', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p
                      ref={(element) => {
                        notificationContentRefs.current[notification.id] = element
                      }}
                      className="text-sm text-slate-700 line-clamp-2"
                    >
                      {notification.content}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      {isContentTruncated[notification.id] && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            navigate(`/notifications/${notification.id}`, {
                              state: { from: '/dashboard' },
                            })
                          }}
                          className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-900 hover:underline"
                        >
                          詳細を見る
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      )}
                      {notification.link && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            navigate(notification.link!)
                          }}
                          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          関連ページへ移動
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border/60 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            <ClipboardList className="h-4 w-4" />
            Today
          </div>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{dailyOverview.length}</p>
          <p className="text-sm text-muted-foreground">本日の作業数</p>
        </div>
        <div className={`rounded-xl border-2 p-5 ${
          unsignedWorks.length > 0 
            ? 'border-red-300 bg-red-50' 
            : 'border-border/60 bg-white'
        }`}>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            <ShieldAlert className={`h-4 w-4 ${unsignedWorks.length > 0 ? 'text-red-600' : ''}`} />
            Unsigned
          </div>
          <p className={`mt-3 text-2xl font-semibold ${
            unsignedWorks.length > 0 ? 'text-red-900' : 'text-slate-900'
          }`}>
            {unsignedWorks.length}
          </p>
          <p className={`text-sm ${
            unsignedWorks.length > 0 ? 'text-red-700' : 'text-muted-foreground'
          }`}>
            未署名の作業
          </p>
          {unsignedWorks.length > 0 && (
            <button
              onClick={() => navigate(`/works/${unsignedWorks[0].work.id}`)}
              className="mt-3 w-full rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
            >
              確認が必要です
            </button>
          )}
        </div>
        <div className="rounded-xl border border-border/60 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            <Users className="h-4 w-4" />
            Members
          </div>
          <p className="mt-3 text-2xl font-semibold text-slate-900">12</p>
          <p className="text-sm text-muted-foreground">アクティブメンバー</p>
        </div>
      </div>

      {/* Risk Trend Chart */}
      <div className="rounded-xl border border-border/60 bg-white p-6">
        <div className="mb-6 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-slate-700" />
          <h3 className="text-lg font-semibold text-slate-900">7日間のリスク推移</h3>
        </div>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart data={riskTrendData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="var(--color-count)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </div>

      {/* Group Ranking */}
      <div className="rounded-xl border border-border/60 bg-white p-6">
        <div className="mb-6 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-slate-700" />
          <h3 className="text-lg font-semibold text-slate-900">グループ別完了率ランキング</h3>
        </div>
        <div className="space-y-5">
          {groupRanking.map((group, index) => (
            <div key={group.name} className="border-b border-border/40 pb-4 last:border-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                    {index + 1}
                  </span>
                  <span className="font-medium text-slate-900">{group.name}</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">{group.correctionRate}%</span>
              </div>
              <div className="space-y-1">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                    style={{ width: `${group.correctionRate}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  安全チェック: {group.safetyCheckRate}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6">
        <section className="rounded-xl border border-border/60 bg-white">
          <div className="border-b border-border/60 px-6 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Today Works
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">今日の作業</h2>
          </div>
          <div className="divide-y">
            {todayWorks.map((overview) => (
              <button
                key={overview.work.id}
                type="button"
                onClick={() => navigate(`/works/${overview.work.id}`)}
                className="flex w-full flex-wrap items-center justify-between gap-3 px-6 py-4 text-left transition-colors hover:bg-slate-50"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{overview.work.title}</p>
                  <p className="text-xs text-muted-foreground">{overview.work.description}</p>
                </div>
                {acknowledgments[overview.work.id] ? (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    確認済み
                  </span>
                ) : (
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                    未確認
                  </span>
                )}
              </button>
            ))}
            {todayWorks.length === 0 && (
              <div className="px-6 py-6 text-sm text-muted-foreground">
                本日の作業はありません。
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-6">
        <section className="rounded-xl border border-border/60 bg-white">
          <div className="border-b border-border/60 px-6 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Incidents / Near Miss
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">直近のインシデント / ヒヤリハット</h2>
          </div>
          <div className="divide-y">
            {recentIncidents.map((incident) => (
              <button
                key={incident.id}
                type="button"
                onClick={() => navigate(`/incidents/${incident.id}`)}
                className="flex w-full items-start justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-slate-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-slate-900">{incident.title}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        (incident.type || 'incident') === 'incident'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {(incident.type || 'incident') === 'incident' ? 'インシデント' : 'ヒヤリハット'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{incident.root_cause}</p>
                  {incident.work_title && (
                    <p className="mt-1 text-xs text-muted-foreground">関連作業: {incident.work_title}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {new Date(incident.date).toLocaleDateString('ja-JP')}
                  </p>
                  <span
                    className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                      incident.status === 'resolved'
                        ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    {incident.status === 'open' ? '対応中' : '解決済'}
                  </span>
                </div>
              </button>
            ))}
            {recentIncidents.length === 0 && (
              <div className="px-6 py-6 text-sm text-muted-foreground">
                直近のインシデント / ヒヤリハットはありません。
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
