import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import PageHeader from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { notifications, fetchNotifications, addNotification, loading, error } = useNotificationStore()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState<'info' | 'warning' | 'urgent' | 'success'>('info')
  const [link, setLink] = useState('')
  const [displayDays, setDisplayDays] = useState('7')
  const [noExpiry, setNoExpiry] = useState(false)
  const [pinned, setPinned] = useState(false)

  useEffect(() => {
    void fetchNotifications()
  }, [fetchNotifications])

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [notifications])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!title.trim() || !content.trim()) {
      return
    }
    const trimmedDays = displayDays.trim()
    const daysValue = Number(trimmedDays)
    if (!noExpiry && !pinned) {
      if (!trimmedDays || Number.isNaN(daysValue) || daysValue <= 0) {
        toast.error('表示日数を正しく入力してください。')
        return
      }
    }
    let displayUntil: string | null = null
    if (!noExpiry && !pinned) {
      const until = new Date()
      until.setDate(until.getDate() + daysValue)
      displayUntil = until.toISOString()
    }
    try {
      await addNotification({
        title: title.trim(),
        content: content.trim(),
        type,
        link: link.trim() || undefined,
        display_until: displayUntil,
        pinned,
      })
      toast.success('お知らせを追加しました。')
      setTitle('')
      setContent('')
      setType('info')
      setLink('')
      setDisplayDays('7')
      setNoExpiry(false)
      setPinned(false)
    } catch {
      toast.error('お知らせの追加に失敗しました。')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="お知らせ管理"
        subtitle="全体通知を作成・管理します。"
        actions={
          <Button variant="outline" size="sm" onClick={() => fetchNotifications()}>
            再読み込み
          </Button>
        }
      />

      <section className="rounded-xl border border-border/60 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">
              Create
            </p>
            <h2 className="mt-2 text-xl font-semibold">お知らせ追加</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              重要度やリンクを設定して全体に通知します。
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="notification-title">タイトル</Label>
            <Input
              id="notification-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="例: 【重要】システムメンテナンスのお知らせ"
            />
          </div>
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="notification-content">内容</Label>
            <Input
              id="notification-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="通知内容を入力してください"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notification-type">種別</Label>
            <Select value={type} onValueChange={(value) => setType(value as typeof type)}>
              <SelectTrigger id="notification-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(typeLabel).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notification-link">リンク（任意）</Label>
            <Input
              id="notification-link"
              value={link}
              onChange={(event) => setLink(event.target.value)}
              placeholder="/incidents"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notification-days">表示日数</Label>
            <Input
              id="notification-days"
              type="number"
              min="1"
              value={displayDays}
              onChange={(event) => setDisplayDays(event.target.value)}
              placeholder="7"
              disabled={noExpiry || pinned}
            />
            <p className="text-xs text-muted-foreground">
              既定は1週間。空欄にしたい場合は「期限なし」を選択してください。
            </p>
          </div>
          <div className="space-y-2">
            <Label>表示設定</Label>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="no-expiry"
                  checked={noExpiry}
                  onCheckedChange={(checked) => setNoExpiry(checked === true)}
                  disabled={pinned}
                />
                <Label htmlFor="no-expiry" className="font-normal text-muted-foreground">
                  期限なし
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="pinned"
                  checked={pinned}
                  onCheckedChange={(checked) => setPinned(checked === true)}
                />
                <Label htmlFor="pinned" className="font-normal text-muted-foreground">
                  固定表示
                </Label>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2">
            <Button type="submit" disabled={!title.trim() || !content.trim()}>
              追加
            </Button>
          </div>
        </form>
      </section>

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
              {notifications.length} items
            </span>
          </div>
        </div>
        <div className="px-6 py-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          {loading ? (
            <p className="text-sm text-muted-foreground">読み込み中...</p>
          ) : sortedNotifications.length === 0 ? (
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
                {sortedNotifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/notifications/${notification.id}`, {
                            state: { from: '/notifications' },
                          })
                        }
                        className="text-left font-medium text-slate-900 hover:underline"
                      >
                        {notification.title}
                      </button>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
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
                      <span className={`rounded-full border px-2 py-0.5 text-xs ${notification.is_read ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-blue-200 bg-blue-50 text-blue-700'}`}>
                        {notification.is_read ? '既読' : '未読'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          navigate(`/notifications/${notification.id}`, {
                            state: { from: '/notifications' },
                          })
                        }
                      >
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
    </div>
  )
}
