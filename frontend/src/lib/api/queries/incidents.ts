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
  addIncidentComment,
  addIncidentLabel,
  createIncident,
  fetchIncident,
  fetchIncidentActivities,
  fetchIncidentComments,
  fetchIncidents,
  fetchUsers,
  removeIncidentLabel,
  updateIncidentAssignment,
  updateIncidentStatus,
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

export type IncidentDetailQueryOptions<TData = Incident, TError = Error> = Omit<
  UseQueryOptions<Incident, TError, TData>,
  'queryKey' | 'queryFn'
>

export const createIncidentDetailQueryOptions = <TData = Incident, TError = Error>(
  incidentId: number,
  queryConfig?: IncidentDetailQueryOptions<TData, TError>,
) =>
  queryOptions({
    ...queryConfig,
    queryKey: queryKeys.incidents.detail(incidentId),
    queryFn: () => fetchIncident(incidentId),
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

export const createIncidentStatusMutationOptions = (incidentId: number) =>
  mutationOptions({
    mutationFn: ({ status }: { status: Incident['status'] }) =>
      updateIncidentStatus(incidentId, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.incidents.detail(incidentId) })
      await queryClient.invalidateQueries({ queryKey: queryKeys.incidents.list() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.incidents.activities(incidentId) })
    },
  })

export const createIncidentCommentMutationOptions = (incidentId: number) =>
  mutationOptions({
    mutationFn: ({ content }: { content: string }) => addIncidentComment(incidentId, content),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.incidents.comments(incidentId) })
      await queryClient.invalidateQueries({ queryKey: queryKeys.incidents.activities(incidentId) })
      await queryClient.invalidateQueries({ queryKey: queryKeys.incidents.detail(incidentId) })
    },
  })

export const createIncidentAssignmentMutationOptions = (incidentId: number) =>
  mutationOptions({
    mutationFn: ({ assigneeId }: { assigneeId: number | null }) =>
      updateIncidentAssignment(incidentId, assigneeId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.incidents.detail(incidentId) })
      await queryClient.invalidateQueries({ queryKey: queryKeys.incidents.list() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.incidents.activities(incidentId) })
    },
  })

export const createIncidentAddLabelMutationOptions = (incidentId: number) =>
  mutationOptions({
    mutationFn: ({ label }: { label: string }) => addIncidentLabel(incidentId, label),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.incidents.detail(incidentId) })
      await queryClient.invalidateQueries({ queryKey: queryKeys.incidents.list() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.incidents.activities(incidentId) })
    },
  })

export const createIncidentRemoveLabelMutationOptions = (incidentId: number) =>
  mutationOptions({
    mutationFn: ({ label }: { label: string }) => removeIncidentLabel(incidentId, label),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.incidents.detail(incidentId) })
      await queryClient.invalidateQueries({ queryKey: queryKeys.incidents.list() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.incidents.activities(incidentId) })
    },
  })