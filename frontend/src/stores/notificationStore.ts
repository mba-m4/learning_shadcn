import { create } from 'zustand'
import type { Notification } from '@/types/api'
import { createNotification, fetchNotifications, markNotificationAsRead } from '@/features/notifications/api/service'
import { getErrorMessage } from '@/shared/api/client'

interface NotificationState {
  notifications: Notification[]
  loading: boolean
  error: string | null
  fetchNotifications: (params?: { unreadOnly?: boolean; limit?: number }) => Promise<void>
  addNotification: (payload: {
    title: string
    content: string
    type: Notification['type']
    link?: string
    display_until?: string | null
    pinned?: boolean
  }) => Promise<void>
  markAsRead: (notificationId: number) => Promise<void>
  unreadCount: () => number
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  loading: false,
  error: null,

  fetchNotifications: async (params) => {
    set({ loading: true, error: null })
    try {
      const data = await fetchNotifications(params)
      set({ notifications: data, loading: false })
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error) })
    }
  },

  addNotification: async (payload) => {
    try {
      const created = await createNotification(payload)
      set((state) => ({ notifications: [created, ...state.notifications] }))
    } catch (error) {
      set({ error: getErrorMessage(error) })
      throw error
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const updated = await markNotificationAsRead(notificationId)
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? updated : n
        ),
      }))
    } catch (error) {
      set({ error: getErrorMessage(error) })
    }
  },

  unreadCount: () => {
    return get().notifications.filter((n) => !n.is_read).length
  },
}))
