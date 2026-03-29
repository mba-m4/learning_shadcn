import {
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  ClipboardList,
  Info,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { Button as BitButton } from '@/components/ui/8bit/button'

interface NotificationItem {
  id: number
  title: string
  content: string
  type: 'info' | 'warning' | 'urgent' | 'success'
}

interface IncidentItem {
  id: number
  title: string
  root_cause: string
  type?: string | null
}

interface WorkOverviewItem {
  work: {
    id: number
    title: string
    description: string
  }
}

const chartConfig = {
  incidents: {
    label: 'インシデント',
    color: '#f97316',
  },
  nearMisses: {
    label: 'ヒヤリハット',
    color: '#0ea5e9',
  },
} satisfies ChartConfig

export function DashboardHeroStats({
  todayCount,
  unsignedCount,
  riskCount,
  onOpenUnsignedWork,
}: {
  todayCount: number
  unsignedCount: number
  riskCount: number
  onOpenUnsignedWork(): void
}) {
  return (
    <div className="grid animate-in gap-6 md:grid-cols-3">
      <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-all duration-500 group-hover:scale-150" />
        <div className="relative">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-2 ring-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:ring-primary/40">
                <ClipboardList className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Today</span>
            </div>
            <Sparkles className="h-5 w-5 text-primary/40 transition-all duration-300 group-hover:text-primary" />
          </div>
          <p className="text-gradient text-4xl font-bold tracking-tight">{todayCount}</p>
          <p className="mt-2 text-sm font-medium text-muted-foreground">本日の作業数</p>
        </div>
      </div>

      <div
        className={`group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 ${
          unsignedCount > 0
            ? 'border-destructive/40 bg-gradient-to-br from-destructive/5 to-transparent'
            : ''
        }`}
      >
        <div
          className={`absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl transition-all duration-500 group-hover:scale-150 ${
            unsignedCount > 0 ? 'bg-destructive/20' : 'bg-amber-500/10'
          }`}
        />
        <div className="relative">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ring-2 transition-all duration-300 group-hover:scale-110 ${
                  unsignedCount > 0
                    ? 'bg-destructive/10 ring-destructive/40 group-hover:ring-destructive/60'
                    : 'bg-amber-100 ring-amber-200 group-hover:ring-amber-300'
                }`}
              >
                <ShieldAlert className={`h-6 w-6 ${unsignedCount > 0 ? 'text-destructive' : 'text-amber-600'}`} />
              </div>
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Alert</span>
            </div>
            {unsignedCount > 0 && <Zap className="h-5 w-5 animate-pulse text-destructive" />}
          </div>
          <p className={`text-4xl font-bold tracking-tight ${unsignedCount > 0 ? 'text-destructive' : 'text-gradient'}`}>
            {unsignedCount}
          </p>
          <p className="mt-2 text-sm font-medium text-muted-foreground">未署名の作業</p>
          {unsignedCount > 0 && (
            <BitButton onClick={onOpenUnsignedWork} font="retro" className="mt-4 w-full">
              今すぐ確認
            </BitButton>
          )}
        </div>
      </div>

      <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl transition-all duration-500 group-hover:scale-150" />
        <div className="relative">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 ring-2 ring-emerald-200 transition-all duration-300 group-hover:scale-110 group-hover:ring-emerald-300">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Team</span>
            </div>
            <Target className="h-5 w-5 text-emerald-500/40 transition-all duration-300 group-hover:text-emerald-500" />
          </div>
          <p className="text-gradient text-4xl font-bold tracking-tight">{riskCount}</p>
          <p className="mt-2 text-sm font-medium text-muted-foreground">登録済みリスク</p>
        </div>
      </div>
    </div>
  )
}

export function DashboardNotificationsPanel({
  notifications,
  onOpenList,
  onOpenDetail,
}: {
  notifications: NotificationItem[]
  onOpenList(): void
  onOpenDetail(notificationId: number): void
}) {
  if (notifications.length === 0) {
    return null
  }

  return (
    <section className="glass-panel animate-in rounded-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">お知らせ</h2>
            <p className="text-xs text-muted-foreground">最新の情報をチェック</p>
          </div>
        </div>
        <button onClick={onOpenList} className="text-sm font-semibold text-primary hover:underline">
          すべて見る →
        </button>
      </div>
      <div className="space-y-3">
        {notifications.map((notification) => (
          <button
            key={notification.id}
            onClick={() => onOpenDetail(notification.id)}
            className="group w-full rounded-xl border border-border/50 bg-card/50 p-4 text-left transition-all duration-200 hover:border-primary/30 hover:bg-card/80 hover:shadow-lg"
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
                  notification.type === 'urgent'
                    ? 'bg-destructive/10 text-destructive'
                    : notification.type === 'warning'
                      ? 'bg-amber-100 text-amber-600'
                      : notification.type === 'success'
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-primary/10 text-primary'
                }`}
              >
                {notification.type === 'urgent' || notification.type === 'warning' ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : notification.type === 'success' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Info className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary">
                  {notification.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{notification.content}</p>
              </div>
              <ChevronRight className="h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}

export function DashboardIncidentTrendSection({
  incidentTrendData,
}: {
  incidentTrendData: Array<{ date: string; incidents: number; nearMisses: number }>
}) {
  return (
    <div className="animate-in rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-1/10">
          <TrendingUp className="h-5 w-5 text-chart-1" />
        </div>
        <div>
          <h3 className="text-lg font-bold">直近の事象発生件数</h3>
          <p className="text-xs text-muted-foreground">日付ごとのインシデントとヒヤリハットの件数</p>
        </div>
      </div>
      <ChartContainer config={chartConfig} className="h-64 w-full">
        <BarChart data={incidentTrendData} accessibilityLayer>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} style={{ fontSize: '12px' }} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="incidents" stackId="events" fill="var(--color-incidents)" radius={[0, 0, 0, 0]} />
          <Bar dataKey="nearMisses" stackId="events" fill="var(--color-nearMisses)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  )
}

export function DashboardTodayWorksSection({
  works,
  acknowledgments,
  onOpenWork,
}: {
  works: WorkOverviewItem[]
  acknowledgments: Record<number, boolean>
  onOpenWork(workId: number): void
}) {
  return (
    <section className="animate-in overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border/40 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <ClipboardList className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold">今日の作業</h2>
            <p className="text-xs text-muted-foreground">{works.length}件の作業が予定されています</p>
          </div>
        </div>
      </div>
      <div className="divide-y divide-border/40">
        {works.map((overview) => (
          <button
            key={overview.work.id}
            onClick={() => onOpenWork(overview.work.id)}
            className="group flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-all duration-200 hover:bg-accent/50"
          >
            <div className="flex-1">
              <p className="font-semibold text-foreground transition-colors group-hover:text-primary">
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
              <span className="flex animate-pulse items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                <AlertTriangle className="h-3 w-3" />
                未確認
              </span>
            )}
          </button>
        ))}
        {works.length === 0 && <div className="px-6 py-12 text-center text-muted-foreground">本日の作業はありません</div>}
      </div>
    </section>
  )
}

export function DashboardRecentIncidentsSection({
  incidents,
  onOpenIncident,
}: {
  incidents: IncidentItem[]
  onOpenIncident(incidentId: number): void
}) {
  if (incidents.length === 0) {
    return null
  }

  return (
    <section className="animate-in overflow-hidden rounded-xl border border-border bg-card shadow-sm">
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
        {incidents.map((incident) => (
          <button
            key={incident.id}
            onClick={() => onOpenIncident(incident.id)}
            className="group flex w-full items-start justify-between gap-4 px-6 py-4 text-left transition-all duration-200 hover:bg-accent/50"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground transition-colors group-hover:text-primary">
                  {incident.title}
                </p>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    (incident.type || 'incident') === 'incident'
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
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
  )
}