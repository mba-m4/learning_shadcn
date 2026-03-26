import {
	mutationOptions,
	queryOptions,
	type UseQueryOptions,
} from '@tanstack/react-query'
import type { Notification } from '@/types/api'
import { queryClient } from '@/shared/api/queryClient'
import { queryKeys } from '@/shared/api/queryKeys'
import {
	createNotification,
	fetchNotification,
	fetchNotifications,
	markNotificationAsRead,
} from './service'

export type NotificationsQueryOptions<TData = Notification[], TError = Error> = Omit<
	UseQueryOptions<Notification[], TError, TData>,
	'queryKey' | 'queryFn'
>

export const createNotificationsQueryOptions = <
	TData = Notification[],
	TError = Error,
>(
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
>(
	notificationId: number,
	queryConfig?: NotificationDetailQueryOptions<TData, TError>,
) =>
	queryOptions({
		...queryConfig,
		queryKey: queryKeys.notifications.detail(notificationId),
		queryFn: () => fetchNotification(notificationId),
	})

export const createCreateNotificationMutationOptions = (params?: {
	unreadOnly?: boolean
	limit?: number
}) =>
	mutationOptions({
		mutationFn: createNotification,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() })
			await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list(params) })
		},
	})

export const createMarkNotificationAsReadMutationOptions = (params?: {
	unreadOnly?: boolean
	limit?: number
}) =>
	mutationOptions({
		mutationFn: ({ notificationId }: { notificationId: number }) =>
			markNotificationAsRead(notificationId),
		onSuccess: async (_data, variables) => {
			await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() })
			await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list(params) })
			await queryClient.invalidateQueries({
				queryKey: queryKeys.notifications.detail(variables.notificationId),
			})
		},
	})