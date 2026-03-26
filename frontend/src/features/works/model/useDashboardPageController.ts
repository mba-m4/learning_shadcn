import { useQueries, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { createIncidentsQueryOptions } from '@/features/incidents/api/queries'
import { createNotificationsQueryOptions } from '@/features/notifications/api/queries'
import { createRiskRecordsQueryOptions } from '@/features/risk-registry/api/queries'
import {
  createWorkAcknowledgmentQueryOptions,
  createWorkDailyOverviewQueryOptions,
} from '@/features/works/api/queries'

const selectRecentIncidents = <T extends { id: number }>(incidents: T[]) => incidents.slice(0, 5)

const selectRiskTrendData = (risks: Array<{ severity: 'high' | 'medium' | 'low' }>) => {
  const counts = risks.reduce<Record<'high' | 'medium' | 'low', number>>(
    (accumulator, risk) => {
      accumulator[risk.severity] += 1
      return accumulator
    },
    { high: 0, medium: 0, low: 0 },
  )

  return {
    riskCount: risks.length,
    riskTrendData: [
      { date: 'High', count: counts.high },
      { date: 'Medium', count: counts.medium },
      { date: 'Low', count: counts.low },
    ],
  }
}

const selectActiveNotifications = <T extends {
  pinned?: boolean
  display_until?: string | null
  created_at: string
}>(notifications: T[]) => {
  const now = new Date()
  return [...notifications]
    .filter(
      (notification) =>
        notification.pinned ||
        !notification.display_until ||
        new Date(notification.display_until) >= now,
    )
    .sort((a, b) => {
      if (a.pinned && !b.pinned) {
        return -1
      }
      if (!a.pinned && b.pinned) {
        return 1
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    .slice(0, 3)
}

export function useDashboardPageController() {
  const navigate = useNavigate()
  const date = new Date().toISOString().slice(0, 10)

  const dailyOverviewQuery = useQuery(createWorkDailyOverviewQueryOptions(date))
  const incidentsQuery = useQuery(
    createIncidentsQueryOptions({
      select: selectRecentIncidents,
    }),
  )
  const notificationsQuery = useQuery(
    createNotificationsQueryOptions(
      { limit: 20 },
      {
        select: selectActiveNotifications,
      },
    ),
  )
  const risksQuery = useQuery(
    createRiskRecordsQueryOptions({
      select: selectRiskTrendData,
    }),
  )

  const dailyOverview = dailyOverviewQuery.data ?? []
  const recentIncidents = incidentsQuery.data ?? []
  const activeNotifications = notificationsQuery.data ?? []
  const riskView = risksQuery.data ?? { riskCount: 0, riskTrendData: [] }

  const acknowledgmentQueries = useQueries({
    queries: dailyOverview.map((overview) => ({
      ...createWorkAcknowledgmentQueryOptions(overview.work.id),
      retry: false,
    })),
  })

  const acknowledgments = dailyOverview.reduce<Record<number, boolean>>(
    (accumulator, overview, index) => {
      accumulator[overview.work.id] = Boolean(acknowledgmentQueries[index]?.data)
      return accumulator
    },
    {},
  )

  return {
    acknowledgments,
    activeNotifications,
    dailyOverview,
    hasError:
      Boolean(dailyOverviewQuery.error) ||
      Boolean(incidentsQuery.error) ||
      Boolean(notificationsQuery.error) ||
      Boolean(risksQuery.error),
    navigate,
    recentIncidents,
    riskView,
    todayWorks: dailyOverview.slice(0, 5),
    unsignedWorks: dailyOverview.filter((overview) => !acknowledgments[overview.work.id]),
  }
}