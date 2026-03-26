import {
  mutationOptions,
  queryOptions,
  type UseQueryOptions,
} from '@tanstack/react-query'
import type {
  Incident,
  IncidentActivity,
  IncidentComment,
  User,
} from '@/types/api'
import { queryClient } from '../queryClient'
import { queryKeys } from '../queryKeys'
import {
  createIncident,
  fetchIncidentActivities,
  fetchIncidentComments,
  fetchIncidents,
  fetchUsers,
} from '../incidents'

export type IncidentsQueryOptions<TData = Incident[], TError = Error> = Omit<
  UseQueryOptions<Incident[], TError, TData>,
  'queryKey' | 'queryFn'
>

export const createIncidentsQueryOptions = <
  TData = Incident[],
  TError = Error,
>(queryConfig?: IncidentsQueryOptions<TData, TError>) =>
  queryOptions({
    ...queryConfig,
    queryKey: queryKeys.incidents.list(),
    queryFn: fetchIncidents,
  })

export type IncidentCommentsQueryOptions<
  TData = IncidentComment[],
  TError = Error,
> = Omit<UseQueryOptions<IncidentComment[], TError, TData>, 'queryKey' | 'queryFn'>

export const createIncidentCommentsQueryOptions = <
  TData = IncidentComment[],
  TError = Error,
>(incidentId: number, queryConfig?: IncidentCommentsQueryOptions<TData, TError>) =>
  queryOptions({
    ...queryConfig,
    queryKey: queryKeys.incidents.comments(incidentId),
    queryFn: () => fetchIncidentComments(incidentId),
  })

export type IncidentActivitiesQueryOptions<
  TData = IncidentActivity[],
  TError = Error,
> = Omit<UseQueryOptions<IncidentActivity[], TError, TData>, 'queryKey' | 'queryFn'>

export const createIncidentActivitiesQueryOptions = <
  TData = IncidentActivity[],
  TError = Error,
>(incidentId: number, queryConfig?: IncidentActivitiesQueryOptions<TData, TError>) =>
  queryOptions({
    ...queryConfig,
    queryKey: queryKeys.incidents.activities(incidentId),
    queryFn: () => fetchIncidentActivities(incidentId),
  })

export type UsersQueryOptions<TData = User[], TError = Error> = Omit<
  UseQueryOptions<User[], TError, TData>,
  'queryKey' | 'queryFn'
>

export const createUsersQueryOptions = <
  TData = User[],
  TError = Error,
>(queryConfig?: UsersQueryOptions<TData, TError>) =>
  queryOptions({
    staleTime: 5 * 60 * 1000,
    ...queryConfig,
    queryKey: queryKeys.users.list(),
    queryFn: fetchUsers,
  })

export const createIncidentMutationOptions = () =>
  mutationOptions({
    mutationFn: createIncident,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.incidents.all(),
      })
    },
  })