import {
  mutationOptions,
  queryOptions,
  type UseQueryOptions,
} from '@tanstack/react-query'
import type {
  Comment,
  Manual,
  ManualRisk,
  Meeting,
  MeetingUpload,
  Notification,
  RiskSummary,
} from '@/types/api'
import {
  addComment,
  fetchComments,
} from '../comments'
import {
  createManualRisk,
  deleteRiskAssessment,
  deleteManualRisk,
  fetchManualRisks,
  fetchRiskSummary,
  updateRiskAssessment,
  updateManualRisk,
} from '../risks'
import { generateRisk } from '../works'
import {
  createNotification,
  fetchNotification,
  fetchNotifications,
  markNotificationAsRead,
} from '../notifications'
import { fetchManual, fetchManuals } from '../manuals'
import {
  addMeetingUploads,
  fetchMeeting,
  fetchMeetingUploads,
  fetchMeetings,
  updateMeetingSyncState,
} from '../meetings'
import { queryClient } from '../queryClient'
import { queryKeys } from '../queryKeys'

export type WorkCommentsQueryOptions<TData = Comment[], TError = Error> = Omit<
  UseQueryOptions<Comment[], TError, TData>,
  'queryKey' | 'queryFn'
>

export const createWorkCommentsQueryOptions = <TData = Comment[], TError = Error>(
  workId: number,
  queryConfig?: WorkCommentsQueryOptions<TData, TError>,
) =>
  queryOptions({
    ...queryConfig,
    queryKey: queryKeys.works.comments(workId),
    queryFn: () => fetchComments(workId),
  })

export const createAddWorkCommentMutationOptions = (workId: number) =>
  mutationOptions({
    mutationFn: ({ content }: { content: string }) => addComment(workId, content),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.works.comments(workId) })
    },
  })

export type ManualRisksQueryOptions<TData = ManualRisk[], TError = Error> = Omit<
  UseQueryOptions<ManualRisk[], TError, TData>,
  'queryKey' | 'queryFn'
>

export const createManualRisksQueryOptions = <TData = ManualRisk[], TError = Error>(
  itemId: number,
  queryConfig?: ManualRisksQueryOptions<TData, TError>,
) =>
  queryOptions({
    ...queryConfig,
    queryKey: queryKeys.works.manualRisks(itemId),
    queryFn: () => fetchManualRisks(itemId),
  })

export type RiskSummaryQueryOptions<TData = RiskSummary, TError = Error> = Omit<
  UseQueryOptions<RiskSummary, TError, TData>,
  'queryKey' | 'queryFn'
>

export const createRiskSummaryQueryOptions = <TData = RiskSummary, TError = Error>(
  workId: number,
  queryConfig?: RiskSummaryQueryOptions<TData, TError>,
) =>
  queryOptions({
    ...queryConfig,
    queryKey: queryKeys.works.riskSummary(workId),
    queryFn: () => fetchRiskSummary(workId),
  })

export const createManualRiskMutationOptions = (itemId: number, workId?: number) =>
  mutationOptions({
    mutationFn: ({ content, action }: { content: string; action?: string | null }) =>
      createManualRisk(itemId, content, action),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.works.manualRisks(itemId) })
      if (workId) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.works.riskSummary(workId) })
      }
    },
  })

export const createUpdateManualRiskMutationOptions = (itemId: number, workId?: number) =>
  mutationOptions({
    mutationFn: ({ riskId, payload }: { riskId: number; payload: { content?: string | null; action?: string | null } }) =>
      updateManualRisk(riskId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.works.manualRisks(itemId) })
      if (workId) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.works.riskSummary(workId) })
      }
    },
  })

export const createDeleteManualRiskMutationOptions = (itemId: number, workId?: number) =>
  mutationOptions({
    mutationFn: ({ riskId }: { riskId: number }) => deleteManualRisk(riskId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.works.manualRisks(itemId) })
      if (workId) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.works.riskSummary(workId) })
      }
    },
  })

export const createGenerateRiskMutationOptions = (itemId: number, workId?: number) =>
  mutationOptions({
    mutationFn: () => generateRisk(itemId),
    onSuccess: async () => {
      if (workId) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.works.detail(workId) })
        await queryClient.invalidateQueries({ queryKey: queryKeys.works.acknowledgment(workId) })
      }
    },
  })

export const createUpdateAiRiskMutationOptions = (workId?: number) =>
  mutationOptions({
    mutationFn: ({ riskId, payload }: { riskId: number; payload: { content?: string | null; action?: string | null } }) =>
      updateRiskAssessment(riskId, payload),
    onSuccess: async () => {
      if (workId) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.works.detail(workId) })
        await queryClient.invalidateQueries({ queryKey: queryKeys.works.acknowledgment(workId) })
      }
    },
  })

export const createDeleteAiRiskMutationOptions = (workId?: number) =>
  mutationOptions({
    mutationFn: ({ riskId }: { riskId: number }) => deleteRiskAssessment(riskId),
    onSuccess: async () => {
      if (workId) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.works.detail(workId) })
        await queryClient.invalidateQueries({ queryKey: queryKeys.works.acknowledgment(workId) })
      }
    },
  })

export type NotificationsQueryOptions<TData = Notification[], TError = Error> = Omit<
  UseQueryOptions<Notification[], TError, TData>,
  'queryKey' | 'queryFn'
>

export const createNotificationsQueryOptions = <TData = Notification[], TError = Error>(
  params?: { unreadOnly?: boolean; limit?: number },
  queryConfig?: NotificationsQueryOptions<TData, TError>,
) =>
  queryOptions({
    ...queryConfig,
    queryKey: queryKeys.notifications.list(params),
    queryFn: () => fetchNotifications(params),
  })

export type NotificationDetailQueryOptions<TData = Notification, TError = Error> = Omit<
  UseQueryOptions<Notification, TError, TData>,
  'queryKey' | 'queryFn'
>

export const createNotificationDetailQueryOptions = <
  TData = Notification,
  TError = Error,
>(notificationId: number, queryConfig?: NotificationDetailQueryOptions<TData, TError>) =>
  queryOptions({
    ...queryConfig,
    queryKey: queryKeys.notifications.detail(notificationId),
    queryFn: () => fetchNotification(notificationId),
  })

export const createCreateNotificationMutationOptions = (params?: { unreadOnly?: boolean; limit?: number }) =>
  mutationOptions({
    mutationFn: createNotification,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list(params) })
    },
  })

export const createMarkNotificationAsReadMutationOptions = (params?: { unreadOnly?: boolean; limit?: number }) =>
  mutationOptions({
    mutationFn: ({ notificationId }: { notificationId: number }) => markNotificationAsRead(notificationId),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list(params) })
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.detail(variables.notificationId) })
    },
  })

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

export type MeetingsQueryOptions<TData = Meeting[], TError = Error> = Omit<
  UseQueryOptions<Meeting[], TError, TData>,
  'queryKey' | 'queryFn'
>

export const createMeetingsQueryOptions = <TData = Meeting[], TError = Error>(
  queryConfig?: MeetingsQueryOptions<TData, TError>,
) =>
  queryOptions({
    ...queryConfig,
    queryKey: queryKeys.meetings.list(),
    queryFn: fetchMeetings,
  })

export type MeetingDetailQueryOptions<TData = Meeting, TError = Error> = Omit<
  UseQueryOptions<Meeting, TError, TData>,
  'queryKey' | 'queryFn'
>

export const createMeetingDetailQueryOptions = <TData = Meeting, TError = Error>(
  meetingId: number,
  queryConfig?: MeetingDetailQueryOptions<TData, TError>,
) =>
  queryOptions({
    ...queryConfig,
    queryKey: queryKeys.meetings.detail(meetingId),
    queryFn: () => fetchMeeting(meetingId),
  })

export type MeetingUploadsQueryOptions<TData = MeetingUpload[], TError = Error> = Omit<
  UseQueryOptions<MeetingUpload[], TError, TData>,
  'queryKey' | 'queryFn'
>

export const createMeetingUploadsQueryOptions = <
  TData = MeetingUpload[],
  TError = Error,
>(meetingId?: number | null, queryConfig?: MeetingUploadsQueryOptions<TData, TError>) =>
  queryOptions({
    ...queryConfig,
    queryKey: queryKeys.meetings.uploads(meetingId),
    queryFn: () => fetchMeetingUploads(meetingId),
  })

export const createAddMeetingUploadsMutationOptions = (meetingId?: number | null) =>
  mutationOptions({
    mutationFn: ({ files }: { files: string[] }) => addMeetingUploads(files, meetingId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.meetings.uploads(meetingId) })
    },
  })

export const createUpdateMeetingSyncStateMutationOptions = (meetingId: number) =>
  mutationOptions({
    mutationFn: ({ syncState }: { syncState: string }) =>
      updateMeetingSyncState(meetingId, syncState),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.meetings.detail(meetingId) })
      await queryClient.invalidateQueries({ queryKey: queryKeys.meetings.list() })
    },
  })