import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface NotificationItem {
  id: number
  title: string
  content: string
  type: 'info' | 'warning' | 'urgent' | 'success'
  created_at: string
  display_until?: string | null
  pinned?: boolean
  is_read?: boolean
}

interface Props {
  count: number
  errorMessage: string | null
  loading: boolean
  notifications: NotificationItem[]
  typeLabel: Record<'info' | 'warning' | 'urgent' | 'success', string>
  typeStyles: Record<'info' | 'warning' | 'urgent' | 'success', string>
  onOpenDetail(notificationId: number): void
}

export function NotificationsTableSection({
  count,
  errorMessage,
  loading,
  notifications,
  typeLabel,
  typeStyles,
  onOpenDetail,
}: Props) {
  return (
    <section className="rounded-xl border border-border/60 bg-white">
      <div className="border-b border-border/60 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">
              Directory
            </p>
            <h2 className="mt-2 text-xl font-semibold">お知らせ一覧</h2>
          </div>
          <span className="rounded-full border border-border/60 px-3 py-1 text-xs font-semibold text-muted-foreground">
            {count} items
          </span>
        </div>
      </div>
      <div className="px-6 py-4">
        {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
        {loading ? (
          <p className="text-sm text-muted-foreground">読み込み中...</p>
        ) : notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground">お知らせはまだ登録されていません。</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>タイトル</TableHead>
                <TableHead className="w-24">種別</TableHead>
                <TableHead className="w-28">日付</TableHead>
                <TableHead className="w-32">表示期限</TableHead>
                <TableHead className="w-12">固定</TableHead>
                <TableHead className="w-16">状態</TableHead>
                <TableHead className="w-24">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => onOpenDetail(notification.id)}
                      className="text-left font-medium text-slate-900 hover:underline"
                    >
                      {notification.title}
                    </button>
                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                      {notification.content}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className={`rounded-full border px-2 py-0.5 text-xs ${typeStyles[notification.type]}`}>
                      {typeLabel[notification.type]}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(notification.created_at).toLocaleDateString('ja-JP')}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {notification.display_until
                      ? new Date(notification.display_until).toLocaleDateString('ja-JP')
                      : '—'}
                  </TableCell>
                  <TableCell>
                    {notification.pinned ? (
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                        固定
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs ${
                        notification.is_read
                          ? 'border-slate-200 bg-slate-50 text-slate-600'
                          : 'border-blue-200 bg-blue-50 text-blue-700'
                      }`}
                    >
                      {notification.is_read ? '既読' : '未読'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button type="button" size="sm" variant="outline" onClick={() => onOpenDetail(notification.id)}>
                      詳細
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </section>
  )
}