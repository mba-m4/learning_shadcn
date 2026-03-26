import type { z } from 'zod'
import {
  workDateSummaryParamsSchema,
  workListParamsSchema,
} from './schemas/works'

type WorkListParams = z.infer<typeof workListParamsSchema>
type WorkDateSummaryParams = z.infer<typeof workDateSummaryParamsSchema>

export const queryKeys = {
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  config: {
    catalog: () => ['config', 'catalog'] as const,
  },
  works: {
    all: () => ['works'] as const,
    groups: () => ['works', 'groups'] as const,
    daily: (workDate: string) => ['works', 'daily', workDate] as const,
    acknowledgment: (workId: number) => ['works', 'acknowledgment', workId] as const,
    acknowledgmentHistory: (workId: number) => ['works', 'acknowledgment-history', workId] as const,
    list: (params: WorkListParams) => ['works', 'list', params] as const,
    detail: (workId: number) => ['works', 'detail', workId] as const,
    scene: (workId: number) => ['works', 'scene', workId] as const,
    dates: (params: WorkDateSummaryParams) => ['works', 'dates', params] as const,
    comments: (workId: number) => ['works', 'comments', workId] as const,
    riskSummary: (workId: number) => ['works', 'risk-summary', workId] as const,
    manualRisks: (itemId: number) => ['works', 'manual-risks', itemId] as const,
  },
  incidents: {
    all: () => ['incidents'] as const,
    list: () => ['incidents', 'list'] as const,
    detail: (incidentId: number) => ['incidents', 'detail', incidentId] as const,
    comments: (incidentId: number) => ['incidents', 'comments', incidentId] as const,
    activities: (incidentId: number) => ['incidents', 'activities', incidentId] as const,
  },
  users: {
    list: () => ['users', 'list'] as const,
  },
  notifications: {
    all: () => ['notifications'] as const,
    list: (params?: { unreadOnly?: boolean; limit?: number }) =>
      ['notifications', 'list', params ?? {}] as const,
    detail: (notificationId: number) => ['notifications', 'detail', notificationId] as const,
  },
  manuals: {
    all: () => ['manuals'] as const,
    list: () => ['manuals', 'list'] as const,
    detail: (manualId: number) => ['manuals', 'detail', manualId] as const,
  },
  meetings: {
    all: () => ['meetings'] as const,
    list: () => ['meetings', 'list'] as const,
    detail: (meetingId: number) => ['meetings', 'detail', meetingId] as const,
    uploads: (meetingId?: number | null) => ['meetings', 'uploads', meetingId ?? null] as const,
  },
  risks: {
    all: () => ['risks'] as const,
    list: () => ['risks', 'list'] as const,
    detail: (riskId: number) => ['risks', 'detail', riskId] as const,
  },
  myWorks: {
    all: () => ['my-works'] as const,
    list: (params?: { limit?: number; offset?: number }) => ['my-works', 'list', params ?? {}] as const,
    detail: (workId: number) => ['my-works', 'detail', workId] as const,
    assets: (workId: number) => ['my-works', 'assets', workId] as const,
  },
}