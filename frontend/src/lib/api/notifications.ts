import { request } from './client'
import type { Notification } from '@/types/api'
import {
  createNotificationPayloadSchema,
  notificationSchema,
  notificationsSchema,
} from './schemas/support'

export async function fetchNotifications(params?: {
  unreadOnly?: boolean
  limit?: number
}): Promise<Notification[]> {
  const searchParams = new URLSearchParams()
  if (params?.unreadOnly) {
    searchParams.append('unread_only', 'true')
  }
  if (params?.limit) {
    searchParams.append('limit', String(params.limit))
  }
  
  const query = searchParams.toString()
  const url = query ? `/notifications?${query}` : '/notifications'
  
  return request<Notification[]>(url, undefined, true, notificationsSchema)
}

export async function markNotificationAsRead(notificationId: number): Promise<Notification> {
  return request<Notification>(`/notifications/${notificationId}/read`, {
    method: 'PATCH',
  }, true, notificationSchema)
}

export async function fetchNotification(notificationId: number): Promise<Notification> {
  return request<Notification>(`/notifications/${notificationId}`, undefined, true, notificationSchema)
}

export async function createNotification(payload: {
  title: string
  content: string
  type: Notification['type']
  link?: string
  display_until?: string | null
  pinned?: boolean
}): Promise<Notification> {
  const body = createNotificationPayloadSchema.parse(payload)
  return request<Notification>('/notifications', {
    method: 'POST',
    body,
  }, true, notificationSchema)
}
