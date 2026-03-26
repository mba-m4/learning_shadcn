import {
  mutationOptions,
  queryOptions,
  type UseQueryOptions,
} from '@tanstack/react-query'
import type { RiskRecord } from '@/types/api'
import { queryClient } from '../queryClient'
import { queryKeys } from '../queryKeys'
import {
  addRiskAction,
  fetchRisk,
  fetchRisks,
  updateRiskSeverity,
  updateRiskStatus,
} from '../riskRegistry'

export type RiskRecordsQueryOptions<TData = RiskRecord[], TError = Error> = Omit<
  UseQueryOptions<RiskRecord[], TError, TData>,
  'queryKey' | 'queryFn'
>

export const createRiskRecordsQueryOptions = <TData = RiskRecord[], TError = Error>(
  queryConfig?: RiskRecordsQueryOptions<TData, TError>,
) =>
  queryOptions({
    ...queryConfig,
    queryKey: queryKeys.risks.list(),
    queryFn: fetchRisks,
  })

export type RiskDetailQueryOptions<TData = RiskRecord, TError = Error> = Omit<
  UseQueryOptions<RiskRecord, TError, TData>,
  'queryKey' | 'queryFn'
>

export const createRiskDetailQueryOptions = <TData = RiskRecord, TError = Error>(
  riskId: number,
  queryConfig?: RiskDetailQueryOptions<TData, TError>,
) =>
  queryOptions({
    ...queryConfig,
    queryKey: queryKeys.risks.detail(riskId),
    queryFn: () => fetchRisk(riskId),
  })

export const createRiskStatusMutationOptions = (riskId: number) =>
  mutationOptions({
    mutationFn: ({ status }: { status: RiskRecord['status'] }) => updateRiskStatus(riskId, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.risks.list() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.risks.detail(riskId) })
    },
  })

export const createRiskSeverityMutationOptions = (riskId: number) =>
  mutationOptions({
    mutationFn: ({ severity }: { severity: RiskRecord['severity'] }) =>
      updateRiskSeverity(riskId, severity),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.risks.list() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.risks.detail(riskId) })
    },
  })

export const createRiskActionMutationOptions = (riskId: number) =>
  mutationOptions({
    mutationFn: ({ action }: { action: string }) => addRiskAction(riskId, action),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.risks.list() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.risks.detail(riskId) })
    },
  })