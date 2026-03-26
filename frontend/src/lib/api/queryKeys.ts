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
  works: {
    all: () => ['works'] as const,
    groups: () => ['works', 'groups'] as const,
    daily: (workDate: string) => ['works', 'daily', workDate] as const,
    list: (params: WorkListParams) => ['works', 'list', params] as const,
    detail: (workId: number) => ['works', 'detail', workId] as const,
    dates: (params: WorkDateSummaryParams) => ['works', 'dates', params] as const,
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
}