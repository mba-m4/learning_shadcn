import { useMemo } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, ShieldAlert, Users, AlertTriangle, Info, CheckCircle, ChevronRight, TrendingUp, BarChart3, Sparkles, Zap, Target } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import PageHeader from '@/components/layout/PageHeader'
import { createIncidentsQueryOptions } from '@/features/incidents/api/queries'
import { createNotificationsQueryOptions } from '@/features/notifications/api/queries'
import { createRiskRecordsQueryOptions } from '@/features/risk-registry/api/queries'
import {
  createWorkAcknowledgmentQueryOptions,
  createWorkDailyOverviewQueryOptions,
} from '@/features/works/api/queries'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { Button as BitButton } from '@/components/ui/8bit/button'

export default function DashboardPage() {
  const navigate = useNavigate()
  const date = new Date().toISOString().slice(0, 10)
  const dailyOverviewQuery = useQuery(createWorkDailyOverviewQueryOptions(date))
  const incidentsQuery = useQuery(createIncidentsQueryOptions())
  const notificationsQuery = useQuery(createNotificationsQueryOptions({ limit: 20 }))
  const risksQuery = useQuery(createRiskRecordsQueryOptions())
  const dailyOverview = dailyOverviewQuery.data ?? []
  const incidents = incidentsQuery.data ?? []
  const notifications = notificationsQuery.data ?? []
  const risks = risksQuery.data ?? []
  const acknowledgmentQueries = useQueries({
    queries: dailyOverview.map((overview) => ({
      ...createWorkAcknowledgmentQueryOptions(overview.work.id),
      retry: false,
    })),
  })
  const acknowledgments = useMemo(
    () => dailyOverview.reduce<Record<number, boolean>>((accumulator, overview, index) => {
      accumulator[overview.work.id] = Boolean(acknowledgmentQueries[index]?.data)
      return accumulator
    }, {}),
    [acknowledgmentQueries, dailyOverview],
  )

  const chartConfig = {
    count: {
      label: '件数',
      color: 'hsl(var(--chart-1))',
    },
  } satisfies ChartConfig

  const todayWorks = useMemo(() => dailyOverview.slice(0, 5), [dailyOverview])
  const recentIncidents = useMemo(() => incidents.slice(0, 5), [incidents])
  const unsignedWorks = useMemo(() => {
    return dailyOverview.filter((overview) => !acknowledgments[overview.work.id])
  }, [dailyOverview, acknowledgments])

  const riskTrendData = useMemo(() => {
    const counts = risks.reduce<Record<'high' | 'medium' | 'low', number>>(
      (accumulator, risk) => {
        accumulator[risk.severity] += 1
        return accumulator
      },
      { high: 0, medium: 0, low: 0 },
    )
    return [
      { date: 'High', count: counts.high },
      { date: 'Medium', count: counts.medium },
      { date: 'Low', count: counts.low },
    ]
  }, [risks])

  const activeNotifications = useMemo(() => {
    const now = new Date()
    return [...notifications]
      .filter((n) => n.pinned || !n.display_until || new Date(n.display_until) >= now)
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1
        if (!a.pinned && b.pinned) return 1
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
      .slice(0, 3)
  }, [notifications])

  return (
    <div className="min-h-screen gradient-mesh">
      <div className="space-y-8 pb-12">
        {(dailyOverviewQuery.error || incidentsQuery.error || notificationsQuery.error || risksQuery.error) && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            データ取得に一部失敗しました。
          </div>
        )}
        <div className="sticky top-0 z-10 -mx-6 -mt-6 bg-background/80 px-6 pt-6 backdrop-blur-xl">
          <PageHeader
            title="Dashboard"
            subtitle="作業とリスクの全体像を一望します。"
          />
        </div>

        {/* Hero Stats Cards - 3D Effect */}
        <div className="grid gap-6 md:grid-cols-3 animate-in">
          <div className="group rounded-xl border border-border bg-card shadow-sm relative overflow-hidden p-6">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-all duration-500 group-hover:scale-150" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-2 ring-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:ring-primary/40">
                    <ClipboardList className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Today</span>
                </div>
                <Sparkles className="h-5 w-5 text-primary/40 transition-all duration-300 group-hover:text-primary" />
              </div>
              <p className="text-4xl font-bold tracking-tight text-gradient">{dailyOverview.length}</p>
              <p className="mt-2 text-sm font-medium text-muted-foreground">本日の作業数</p>
            </div>
          </div>

          <div className={`group rounded-xl border border-border bg-card shadow-sm relative overflow-hidden p-6 transition-all duration-300 ${
            unsignedWorks.length > 0 
              ? 'border-destructive/40 bg-gradient-to-br from-destructive/5 to-transparent' 
              : ''
          }`}>
            <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl transition-all duration-500 group-hover:scale-150 ${
              unsignedWorks.length > 0 ? 'bg-destructive/20' : 'bg-amber-500/10'
            }`} />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ring-2 transition-all duration-300 group-hover:scale-110 ${
                    unsignedWorks.length > 0 
                      ? 'bg-destructive/10 ring-destructive/40 group-hover:ring-destructive/60'
                      : 'bg-amber-100 ring-amber-200 group-hover:ring-amber-300'
                  }`}>
                    <ShieldAlert className={`h-6 w-6 ${unsignedWorks.length > 0 ? 'text-destructive' : 'text-amber-600'}`} />
                  </div>
                  <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Alert</span>
                </div>
                {unsignedWorks.length > 0 && <Zap className="h-5 w-5 animate-pulse text-destructive" />}
              </div>
              <p className={`text-4xl font-bold tracking-tight ${
                unsignedWorks.length > 0 ? 'text-destructive' : 'text-gradient'
              }`}>
                {unsignedWorks.length}
              </p>
              <p className="mt-2 text-sm font-medium text-muted-foreground">未署名の作業</p>
              {unsignedWorks.length > 0 && (
                <BitButton
                  onClick={() => navigate(`/works/${unsignedWorks[0].work.id}`)}
                  font="retro"
                  className="mt-4 w-full"
                >
                  今すぐ確認
                </BitButton>
              )}
            </div>
          </div>

          <div className="group rounded-xl border border-border bg-card shadow-sm relative overflow-hidden p-6">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl transition-all duration-500 group-hover:scale-150" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 ring-2 ring-emerald-200 transition-all duration-300 group-hover:scale-110 group-hover:ring-emerald-300">
                    <Users className="h-6 w-6 text-emerald-600" />
                  </div>
                  <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Team</span>
                </div>
                <Target className="h-5 w-5 text-emerald-500/40 transition-all duration-300 group-hover:text-emerald-500" />
              </div>
              <p className="text-4xl font-bold tracking-tight text-gradient">{risks.length}</p>
              <p className="mt-2 text-sm font-medium text-muted-foreground">登録済みリスク</p>
            </div>
          </div>
        </div>

        {/* Notifications Section - Glass Morphism */}
        {activeNotifications.length > 0 && (
          <section className="glass-panel animate-in rounded-2xl p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">お知らせ</h2>
                    <p className="text-xs text-muted-foreground">最新の情報をチェック</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate('/notifications')}
                className="text-sm font-semibold text-primary hover:underline"
              >
                すべて見る →
              </button>
            </div>
            <div className="space-y-3">
              {activeNotifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => navigate(`/notifications/${notification.id}`)}
                  className="group w-full rounded-xl border border-border/50 bg-card/50 p-4 text-left transition-all duration-200 hover:border-primary/30 hover:bg-card/80 hover:shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
                      notification.type === 'urgent' ? 'bg-destructive/10 text-destructive' :
                      notification.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                      notification.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                      'bg-primary/10 text-primary'
                    }`}>
                      {notification.type === 'urgent' || notification.type === 'warning' ? <AlertTriangle className="h-5 w-5" /> :
                       notification.type === 'success' ? <CheckCircle className="h-5 w-5" /> :
                       <Info className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {notification.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {notification.content}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Chart Section - Modern Design */}
        <div className="rounded-xl border border-border bg-card shadow-sm animate-in p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-1/10">
              <TrendingUp className="h-5 w-5 text-chart-1" />
            </div>
            <div>
              <h3 className="text-lg font-bold">リスク優先度分布</h3>
              <p className="text-xs text-muted-foreground">台帳に登録されたリスクの severity 集計</p>
            </div>
          </div>
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <BarChart data={riskTrendData} accessibilityLayer>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                style={{ fontSize: '12px' }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>

        {/* Today's Works - List View */}
        <section className="rounded-xl border border-border bg-card shadow-sm animate-in overflow-hidden">
          <div className="border-b border-border/40 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold">今日の作業</h2>
                <p className="text-xs text-muted-foreground">{todayWorks.length}件の作業が予定されています</p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-border/40">
            {todayWorks.map((overview) => (
              <button
                key={overview.work.id}
                onClick={() => navigate(`/works/${overview.work.id}`)}
                className="group flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-all duration-200 hover:bg-accent/50"
              >
                <div className="flex-1">
                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {overview.work.title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{overview.work.description}</p>
                </div>
                {acknowledgments[overview.work.id] ? (
                  <span className="flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle className="h-3 w-3" />
                    確認済み
                  </span>
                ) : (
                  <span className="flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 animate-pulse">
                    <AlertTriangle className="h-3 w-3" />
                    未確認
                  </span>
                )}
              </button>
            ))}
            {todayWorks.length === 0 && (
              <div className="px-6 py-12 text-center text-muted-foreground">
                本日の作業はありません
              </div>
            )}
          </div>
        </section>

        {/* Recent Incidents */}
        {recentIncidents.length > 0 && (
          <section className="rounded-xl border border-border bg-card shadow-sm animate-in overflow-hidden">
            <div className="border-b border-border/40 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">直近のインシデント</h2>
                  <p className="text-xs text-muted-foreground">過去の事例から学ぶ</p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-border/40">
              {recentIncidents.map((incident) => (
                <button
                  key={incident.id}
                  onClick={() => navigate(`/incidents/${incident.id}`)}
                  className="group flex w-full items-start justify-between gap-4 px-6 py-4 text-left transition-all duration-200 hover:bg-accent/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {incident.title}
                      </p>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        (incident.type || 'incident') === 'incident'
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {(incident.type || 'incident') === 'incident' ? 'インシデント' : 'ヒヤリハット'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{incident.root_cause}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
