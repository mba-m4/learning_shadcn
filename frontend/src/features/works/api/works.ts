import type {
  RiskAssessment,
  Work,
  WorkDateSummary,
  WorkGroup,
  WorkItem,
  WorkListResponse,
  WorkOverview,
  WorkSceneAsset,
  WorkStatus,
} from '@/types/api'
import { request } from '@/shared/api/client'
import {
  createWorkItemPayloadSchema,
  createWorkPayloadSchema,
  riskAssessmentSchema,
  workDateSummaryListSchema,
  workDateSummaryParamsSchema,
  workGroupsResponseSchema,
  workItemSchema,
  workListParamsSchema,
  workListResponseSchema,
  workOverviewListSchema,
  workOverviewSchema,
  workSceneAssetSchema,
  workSchema,
} from '@/shared/api/schemas/works'

export const fetchGroups = () =>
  request<WorkGroup[]>('/works/groups', undefined, true, workGroupsResponseSchema)

export const createGroup = (name: string) =>
  request<WorkGroup>(
    '/works/groups',
    {
      method: 'POST',
      body: { name },
    },
    true,
    workGroupsResponseSchema.element,
  )

export const fetchDailyOverview = (workDate: string) =>
  request<WorkOverview[]>(
    `/works/daily?work_date=${encodeURIComponent(workDate)}`,
    undefined,
    true,
    workOverviewListSchema,
  )

export const createWork = (payload: {
  title: string
  description: string
  group_id: number
  work_date: string
  status: WorkStatus
}) => {
  const parsedPayload = createWorkPayloadSchema.parse(payload)

  return request<Work>(
    '/works',
    {
      method: 'POST',
      body: parsedPayload,
    },
    true,
    workSchema,
  )
}

export const addWorkItem = (
  workId: number,
  payload: { name: string; description: string },
) => {
  const parsedPayload = createWorkItemPayloadSchema.parse(payload)

  return request<WorkItem>(
    `/works/${workId}/items`,
    {
      method: 'POST',
      body: parsedPayload,
    },
    true,
    workItemSchema,
  )
}

export const generateRisk = (workItemId: number) =>
  request<RiskAssessment>(
    `/works/items/${workItemId}/risks/generate`,
    {
      method: 'POST',
    },
    true,
    riskAssessmentSchema,
  )

export const fetchWorkDetail = (workId: number) =>
  request<WorkOverview>(`/works/${workId}`, undefined, true, workOverviewSchema)

export const fetchWorkScene = (workId: number) =>
  request<WorkSceneAsset>(`/works/${workId}/scene`, undefined, true, workSceneAssetSchema)

export const fetchWorkList = (params: {
  start_date?: string
  end_date?: string
  limit?: number
  offset?: number
}) => {
  const parsedParams = workListParamsSchema.parse(params)
  const query = new URLSearchParams()
  if (parsedParams.start_date) query.set('start_date', parsedParams.start_date)
  if (parsedParams.end_date) query.set('end_date', parsedParams.end_date)
  if (parsedParams.limit) query.set('limit', String(parsedParams.limit))
  if (parsedParams.offset) query.set('offset', String(parsedParams.offset))

  return request<WorkListResponse>(
    `/works?${query.toString()}`,
    undefined,
    true,
    workListResponseSchema,
  )
}

export const fetchWorkDateSummary = (params: {
  start_date: string
  end_date: string
}) => {
  const parsedParams = workDateSummaryParamsSchema.parse(params)
  const query = new URLSearchParams({
    start_date: parsedParams.start_date,
    end_date: parsedParams.end_date,
  })

  return request<WorkDateSummary[]>(
    `/works/dates?${query.toString()}`,
    undefined,
    true,
    workDateSummaryListSchema,
  )
}