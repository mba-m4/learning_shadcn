import {
  keepPreviousData,
  mutationOptions,
  queryOptions,
  type UseQueryOptions,
} from '@tanstack/react-query'
import type {
  WorkDateSummary,
  WorkGroup,
  WorkListResponse,
  WorkOverview,
} from '@/types/api'
import { queryKeys } from '../queryKeys'
import {
  createGroup,
  fetchDailyOverview,
  fetchGroups,
  fetchWorkDateSummary,
  fetchWorkDetail,
  fetchWorkList,
} from '../works'

export type WorkGroupsQueryOptions<TData = WorkGroup[], TError = Error> = Omit<
  UseQueryOptions<WorkGroup[], TError, TData>,
  'queryKey' | 'queryFn'
>

export const createWorkGroupsQueryOptions = <
  TData = WorkGroup[],
  TError = Error,
>(queryConfig?: WorkGroupsQueryOptions<TData, TError>) =>
  queryOptions({
    ...queryConfig,
    queryKey: queryKeys.works.groups(),
    queryFn: fetchGroups,
  })

export const createWorkGroupMutationOptions = () =>
  mutationOptions({
    mutationFn: ({ name }: { name: string }) => createGroup(name),
    onSuccess: async () => {
      const { queryClient } = await import('../queryClient')
      await queryClient.invalidateQueries({ queryKey: queryKeys.works.groups() })
    },
  })

export type WorkListParams = Parameters<typeof fetchWorkList>[0]

export type WorkListQueryOptions<TData = WorkListResponse, TError = Error> = Omit<
  UseQueryOptions<WorkListResponse, TError, TData>,
  'queryKey' | 'queryFn'
>

export const createWorkListQueryOptions = <
  TData = WorkListResponse,
  TError = Error,
>(
  params: WorkListParams,
  queryConfig?: WorkListQueryOptions<TData, TError>,
) =>
  queryOptions({
    placeholderData: keepPreviousData,
    ...queryConfig,
    queryKey: queryKeys.works.list(params),
    queryFn: () => fetchWorkList(params),
  })

export type WorkDateSummaryParams = Parameters<typeof fetchWorkDateSummary>[0]

export type WorkDateSummaryQueryOptions<
  TData = WorkDateSummary[],
  TError = Error,
> = Omit<UseQueryOptions<WorkDateSummary[], TError, TData>, 'queryKey' | 'queryFn'>

export const createWorkDateSummaryQueryOptions = <
  TData = WorkDateSummary[],
  TError = Error,
>(
  params: WorkDateSummaryParams,
  queryConfig?: WorkDateSummaryQueryOptions<TData, TError>,
) =>
  queryOptions({
    placeholderData: keepPreviousData,
    ...queryConfig,
    queryKey: queryKeys.works.dates(params),
    queryFn: () => fetchWorkDateSummary(params),
  })

export type WorkDailyOverviewQueryOptions<TData = WorkOverview[], TError = Error> = Omit<
  UseQueryOptions<WorkOverview[], TError, TData>,
  'queryKey' | 'queryFn'
>

export const createWorkDailyOverviewQueryOptions = <
  TData = WorkOverview[],
  TError = Error,
>(
  workDate: string,
  queryConfig?: WorkDailyOverviewQueryOptions<TData, TError>,
) =>
  queryOptions({
    ...queryConfig,
    queryKey: queryKeys.works.daily(workDate),
    queryFn: () => fetchDailyOverview(workDate),
  })

export type WorkDetailQueryOptions<TData = WorkOverview, TError = Error> = Omit<
  UseQueryOptions<WorkOverview, TError, TData>,
  'queryKey' | 'queryFn'
>

export const createWorkDetailQueryOptions = <
  TData = WorkOverview,
  TError = Error,
>(workId: number, queryConfig?: WorkDetailQueryOptions<TData, TError>) =>
  queryOptions({
    ...queryConfig,
    queryKey: queryKeys.works.detail(workId),
    queryFn: () => fetchWorkDetail(workId),
  })