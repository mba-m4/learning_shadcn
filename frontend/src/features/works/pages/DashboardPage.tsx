import PageHeader from '@/components/layout/PageHeader'
import { useDashboardPageController } from '@/features/works/model/useDashboardPageController'
import {
  DashboardHeroStats,
  DashboardNotificationsPanel,
  DashboardRecentIncidentsSection,
  DashboardRiskTrendSection,
  DashboardTodayWorksSection,
} from '@/features/works/ui/DashboardSections'

export default function DashboardPage() {
  const controller = useDashboardPageController()

  return (
    <div className="min-h-screen gradient-mesh">
      <div className="space-y-8 pb-12">
        {controller.hasError && (
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

        <DashboardHeroStats
          todayCount={controller.dailyOverview.length}
          unsignedCount={controller.unsignedWorks.length}
          riskCount={controller.riskView.riskCount}
          onOpenUnsignedWork={() => controller.navigate(`/works/${controller.unsignedWorks[0].work.id}`)}
        />

        <DashboardNotificationsPanel
          notifications={controller.activeNotifications}
          onOpenList={() => controller.navigate('/notifications')}
          onOpenDetail={(notificationId) => controller.navigate(`/notifications/${notificationId}`)}
        />

        <DashboardRiskTrendSection riskTrendData={controller.riskView.riskTrendData} />

        <DashboardTodayWorksSection
          works={controller.todayWorks}
          acknowledgments={controller.acknowledgments}
          onOpenWork={(workId) => controller.navigate(`/works/${workId}`)}
        />

        <DashboardRecentIncidentsSection
          incidents={controller.recentIncidents}
          onOpenIncident={(incidentId) => controller.navigate(`/incidents/${incidentId}`)}
        />
      </div>
    </div>
  )
}
