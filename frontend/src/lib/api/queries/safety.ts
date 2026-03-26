import { mutationOptions, queryOptions, type UseQueryOptions } from '@tanstack/react-query'
import type { WorkRiskAcknowledgment } from '@/types/api'
import { fetchAcknowledgment, fetchAcknowledgmentHistory, submitAcknowledgment, type SubmitAcknowledgmentPayload } from '../safety'
import { queryClient } from '../queryClient'
import { queryKeys } from '../queryKeys'

export type WorkAcknowledgmentQueryOptions<TData = WorkRiskAcknowledgment | null, TError = Error> = Omit<
  UseQueryOptions<WorkRiskAcknowledgment | null, TError, TData>,
  'queryKey' | 'queryFn'
>

export const createWorkAcknowledgmentQueryOptions = <TData = WorkRiskAcknowledgment | null, TError = Error>(
  workId: number,
  queryConfig?: WorkAcknowledgmentQueryOptions<TData, TError>,
) =>
  queryOptions({
    retry: false,
    ...queryConfig,
    queryKey: queryKeys.works.acknowledgment(workId),
    queryFn: () => fetchAcknowledgment(workId),
  })

export type WorkAcknowledgmentHistoryQueryOptions<TData = WorkRiskAcknowledgment[], TError = Error> = Omit<
  UseQueryOptions<WorkRiskAcknowledgment[], TError, TData>,
  'queryKey' | 'queryFn'
>

export const createWorkAcknowledgmentHistoryQueryOptions = <TData = WorkRiskAcknowledgment[], TError = Error>(
  workId: number,
  queryConfig?: WorkAcknowledgmentHistoryQueryOptions<TData, TError>,
) =>
  queryOptions({
    ...queryConfig,
    queryKey: queryKeys.works.acknowledgmentHistory(workId),
    queryFn: () => fetchAcknowledgmentHistory(workId),
  })

export const createSubmitAcknowledgmentMutationOptions = (workId: number) =>
  mutationOptions({
    mutationFn: (payload: SubmitAcknowledgmentPayload) => submitAcknowledgment(workId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.works.acknowledgment(workId) })
      await queryClient.invalidateQueries({ queryKey: queryKeys.works.acknowledgmentHistory(workId) })
    },
  })