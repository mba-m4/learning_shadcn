import { queryOptions, type UseQueryOptions } from '@tanstack/react-query'
import { fetchConfigCatalog, type ConfigCatalog } from '../config'
import { queryKeys } from '../queryKeys'

export type ConfigCatalogQueryOptions<TData = ConfigCatalog, TError = Error> = Omit<
  UseQueryOptions<ConfigCatalog, TError, TData>,
  'queryKey' | 'queryFn'
>

export const createConfigCatalogQueryOptions = <
  TData = ConfigCatalog,
  TError = Error,
>(queryConfig?: ConfigCatalogQueryOptions<TData, TError>) =>
  queryOptions({
    staleTime: 30 * 60 * 1000,
    ...queryConfig,
    queryKey: queryKeys.config.catalog(),
    queryFn: fetchConfigCatalog,
  })