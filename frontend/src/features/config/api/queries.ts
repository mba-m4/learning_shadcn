import { queryOptions, type UseQueryOptions } from '@tanstack/react-query'
import type { ConfigCatalog } from './service'
import { queryKeys } from '@/shared/api/queryKeys'
import { fetchConfigCatalog } from './service'

export type ConfigCatalogQueryOptions<TData = ConfigCatalog, TError = Error> = Omit<
	UseQueryOptions<ConfigCatalog, TError, TData>,
	'queryKey' | 'queryFn'
>

export const createConfigCatalogQueryOptions = <
	TData = ConfigCatalog,
	TError = Error,
>(queryConfig?: ConfigCatalogQueryOptions<TData, TError>) =>
	queryOptions({
		staleTime: 5 * 60 * 1000,
		...queryConfig,
		queryKey: queryKeys.config.catalog(),
		queryFn: fetchConfigCatalog,
	})