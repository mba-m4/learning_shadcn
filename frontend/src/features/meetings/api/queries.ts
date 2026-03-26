import {
	mutationOptions,
	queryOptions,
	type UseQueryOptions,
} from '@tanstack/react-query'
import type { Meeting, MeetingUpload } from '@/types/api'
import { queryClient } from '@/shared/api/queryClient'
import { queryKeys } from '@/shared/api/queryKeys'
import {
	addMeetingUploads,
	fetchMeeting,
	fetchMeetings,
	fetchMeetingUploads,
	updateMeetingSyncState,
} from './service'

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
>(
	meetingId?: number | null,
	queryConfig?: MeetingUploadsQueryOptions<TData, TError>,
) =>
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