import { queryOptions, type UseQueryOptions } from '@tanstack/react-query'
import type { Manual } from '@/types/api'
import { queryKeys } from '@/shared/api/queryKeys'
import { fetchManual, fetchManuals } from './service'

export type ManualsQueryOptions<TData = Manual[], TError = Error> = Omit<
	UseQueryOptions<Manual[], TError, TData>,
	'queryKey' | 'queryFn'
>

export const createManualsQueryOptions = <TData = Manual[], TError = Error>(
	queryConfig?: ManualsQueryOptions<TData, TError>,
) =>
	queryOptions({
		...queryConfig,
		queryKey: queryKeys.manuals.list(),
		queryFn: fetchManuals,
	})

export type ManualDetailQueryOptions<TData = Manual, TError = Error> = Omit<
	UseQueryOptions<Manual, TError, TData>,
	'queryKey' | 'queryFn'
>

export const createManualDetailQueryOptions = <TData = Manual, TError = Error>(
	manualId: number,
	queryConfig?: ManualDetailQueryOptions<TData, TError>,
) =>
	queryOptions({
		...queryConfig,
		queryKey: queryKeys.manuals.detail(manualId),
		queryFn: () => fetchManual(manualId),
	})