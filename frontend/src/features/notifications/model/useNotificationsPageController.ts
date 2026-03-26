import { useCallback, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { createConfigCatalogQueryOptions } from '@/features/config/api/queries'
import type { ConfigCatalog } from '@/features/config/api/service'
import {
  createCreateNotificationMutationOptions,
  createNotificationsQueryOptions,
} from '@/features/notifications/api/queries'
import { getErrorMessage } from '@/shared/api/client'

export const notificationTypeLabel: Record<'info' | 'warning' | 'urgent' | 'success', string> = {
  info: '情報',
  warning: '注意',
  urgent: '緊急',
  success: '成功',
}

export const notificationTypeStyles: Record<'info' | 'warning' | 'urgent' | 'success', string> = {
  info: 'border-blue-200 bg-blue-50 text-blue-700',
  warning: 'border-orange-200 bg-orange-50 text-orange-700',
  urgent: 'border-red-200 bg-red-50 text-red-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
}

const isNotificationType = (
  value: string,
): value is ConfigCatalog['notificationTypes'][number] => value in notificationTypeLabel

const selectSortedNotifications = <T extends { created_at: string; pinned?: boolean }>(notifications: T[]) => {
  return [...notifications].sort((a, b) => {
    if (a.pinned && !b.pinned) {
      return -1
    }
    if (!a.pinned && b.pinned) {
      return 1
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

export function useNotificationsPageController() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState<'info' | 'warning' | 'urgent' | 'success'>('info')
  const [link, setLink] = useState('')
  const [displayDays, setDisplayDays] = useState('7')
  const [noExpiry, setNoExpiry] = useState(false)
  const [pinned, setPinned] = useState(false)

  const selectNotificationTypes = useCallback(
    (catalog: ConfigCatalog) => catalog.notificationTypes.filter(isNotificationType),
    [],
  )

  const notificationsQuery = useQuery(
    createNotificationsQueryOptions({ limit: 100 }, { select: selectSortedNotifications }),
  )
  const configCatalogQuery = useQuery(
    createConfigCatalogQueryOptions({ select: selectNotificationTypes }),
  )
  const createNotificationMutation = useMutation(
    createCreateNotificationMutationOptions({ limit: 100 }),
  )

  const notifications = notificationsQuery.data ?? []
  const notificationTypes =
    configCatalogQuery.data ??
    (Object.keys(notificationTypeLabel) as Array<keyof typeof notificationTypeLabel>)

  const resetForm = () => {
    setTitle('')
    setContent('')
    setType('info')
    setLink('')
    setDisplayDays('7')
    setNoExpiry(false)
    setPinned(false)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!title.trim() || !content.trim()) {
      return
    }

    const trimmedDays = displayDays.trim()
    const daysValue = Number(trimmedDays)
    if (!noExpiry && !pinned && (!trimmedDays || Number.isNaN(daysValue) || daysValue <= 0)) {
      toast.error('表示日数を正しく入力してください。')
      return
    }

    let displayUntil: string | null = null
    if (!noExpiry && !pinned) {
      const until = new Date()
      until.setDate(until.getDate() + daysValue)
      displayUntil = until.toISOString()
    }

    try {
      await createNotificationMutation.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        type,
        link: link.trim() || undefined,
        display_until: displayUntil,
        pinned,
      })
      toast.success('お知らせを追加しました。')
      resetForm()
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const openNotificationDetail = (notificationId: number) => {
    navigate(`/notifications/${notificationId}`, {
      state: { from: '/notifications' },
    })
  }

  return {
    content,
    createPending: createNotificationMutation.isPending,
    displayDays,
    errorMessage: notificationsQuery.error ? getErrorMessage(notificationsQuery.error) : null,
    handleSubmit,
    link,
    noExpiry,
    notificationCount: notifications.length,
    notificationTypes,
    notifications,
    openNotificationDetail,
    pinned,
    refetch: () => void notificationsQuery.refetch(),
    setContent,
    setDisplayDays,
    setLink,
    setNoExpiry,
    setPinned,
    setTitle,
    setType,
    title,
    type,
    typeLabel: notificationTypeLabel,
    typeStyles: notificationTypeStyles,
    loading: notificationsQuery.isLoading,
  }
}