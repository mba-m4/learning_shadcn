import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Bell, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/layout/PageHeader'
import { useNotificationStore } from '@/stores/notificationStore'

const typeLabel: Record<'info' | 'warning' | 'urgent' | 'success', string> = {
  info: '情報',
  warning: '注意',
  urgent: '緊急',
  success: '成功',
}

const typeStyles: Record<'info' | 'warning' | 'urgent' | 'success', string> = {
  info: 'border-blue-200 bg-blue-50 text-blue-700',
  warning: 'border-orange-200 bg-orange-50 text-orange-700',
  urgent: 'border-red-200 bg-red-50 text-red-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
}

export default function NotificationDetailPage() {
  const { notificationId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { notifications, fetchNotifications, markAsRead } = useNotificationStore()
  const notificationIdNumber = Number(notificationId)
  const backTo = (location.state as { from?: string } | null)?.from ?? '/notifications'

  useEffect(() => {
    if (Number.isNaN(notificationIdNumber)) {
      return
    }
    if (notifications.length === 0) {
      void fetchNotifications()
    }
  }, [fetchNotifications, notificationIdNumber, notifications.length])

  const notification = useMemo(
    () => notifications.find((item) => item.id === notificationIdNumber),
    [notificationIdNumber, notifications]
  )

  useEffect(() => {
    if (notification && !notification.is_read) {
      void markAsRead(notification.id)
    }
  }, [markAsRead, notification])

  if (!notification) {
    return (
      <div className="space-y-4">
        <PageHeader title="お知らせ詳細" subtitle="" />
        <p className="text-sm text-muted-foreground">お知らせが見つかりません。</p>
        <Button variant="outline" onClick={() => navigate(backTo)}>
          一覧へ戻る
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="お知らせ詳細" subtitle="" />
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(backTo)}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          一覧に戻る
        </Button>
      </div>

      <section className="rounded-xl border border-border/60 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <h1 className="text-xl font-semibold text-slate-900">{notification.title}</h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {new Date(notification.created_at).toLocaleString('ja-JP')}
            </p>
          </div>
          <span className={`rounded-full border px-2 py-0.5 text-xs ${typeStyles[notification.type]}`}>
            {typeLabel[notification.type]}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span>
            表示期限:
            {' '}
            {notification.display_until
              ? new Date(notification.display_until).toLocaleDateString('ja-JP')
              : 'なし'}
          </span>
          {notification.pinned && (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-amber-700">
              固定表示
            </span>
          )}
        </div>
        <div className="mt-6 text-sm text-slate-900 whitespace-pre-wrap">
          {notification.content}
        </div>
        {notification.link && (
          <div className="mt-6">
            <Button variant="outline" onClick={() => navigate(notification.link!)}>
              関連ページへ移動
            </Button>
          </div>
        )}
      </section>
    </div>
  )
}
