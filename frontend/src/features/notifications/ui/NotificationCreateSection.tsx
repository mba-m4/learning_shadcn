import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Props {
  title: string
  content: string
  type: 'info' | 'warning' | 'urgent' | 'success'
  link: string
  displayDays: string
  noExpiry: boolean
  pinned: boolean
  pending: boolean
  notificationTypes: Array<'info' | 'warning' | 'urgent' | 'success'>
  typeLabel: Record<'info' | 'warning' | 'urgent' | 'success', string>
  onSubmit(event: React.FormEvent<HTMLFormElement>): void
  onTitleChange(value: string): void
  onContentChange(value: string): void
  onTypeChange(value: 'info' | 'warning' | 'urgent' | 'success'): void
  onLinkChange(value: string): void
  onDisplayDaysChange(value: string): void
  onNoExpiryChange(value: boolean): void
  onPinnedChange(value: boolean): void
}

export function NotificationCreateSection({
  title,
  content,
  type,
  link,
  displayDays,
  noExpiry,
  pinned,
  pending,
  notificationTypes,
  typeLabel,
  onSubmit,
  onTitleChange,
  onContentChange,
  onTypeChange,
  onLinkChange,
  onDisplayDaysChange,
  onNoExpiryChange,
  onPinnedChange,
}: Props) {
  return (
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
      <form onSubmit={onSubmit} className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-2 lg:col-span-2">
          <Label htmlFor="notification-title">タイトル</Label>
          <Input
            id="notification-title"
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder="例: 【重要】システムメンテナンスのお知らせ"
          />
        </div>
        <div className="space-y-2 lg:col-span-2">
          <Label htmlFor="notification-content">内容</Label>
          <Input
            id="notification-content"
            value={content}
            onChange={(event) => onContentChange(event.target.value)}
            placeholder="通知内容を入力してください"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notification-type">種別</Label>
          <Select value={type} onValueChange={onTypeChange}>
            <SelectTrigger id="notification-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {notificationTypes.map((value) => (
                <SelectItem key={value} value={value}>
                  {typeLabel[value]}
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
            onChange={(event) => onLinkChange(event.target.value)}
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
            onChange={(event) => onDisplayDaysChange(event.target.value)}
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
                onCheckedChange={(checked) => onNoExpiryChange(checked === true)}
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
                onCheckedChange={(checked) => onPinnedChange(checked === true)}
              />
              <Label htmlFor="pinned" className="font-normal text-muted-foreground">
                固定表示
              </Label>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2">
          <Button type="submit" disabled={!title.trim() || !content.trim() || pending}>
            追加
          </Button>
        </div>
      </form>
    </section>
  )
}