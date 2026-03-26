import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import {
  MessageSquare,
  CheckCircle,
  UserPlus,
  Tag,
  AlertCircle,
} from 'lucide-react'
import type { IncidentActivity, IncidentComment } from '@/types/api'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface TimelineItem {
  id: string
  type: 'activity' | 'comment'
  user_name: string
  created_at: string
  activity?: IncidentActivity
  comment?: IncidentComment
}

interface IncidentTimelineProps {
  activities: IncidentActivity[]
  comments: IncidentComment[]
  onAddComment: (content: string) => Promise<void>
}

const getActivityIcon = (actionType: IncidentActivity['action_type']) => {
  switch (actionType) {
    case 'created':
      return <AlertCircle className="h-4 w-4" />
    case 'comment':
      return <MessageSquare className="h-4 w-4" />
    case 'status_change':
      return <CheckCircle className="h-4 w-4" />
    case 'assignment':
      return <UserPlus className="h-4 w-4" />
    case 'label_added':
    case 'label_removed':
      return <Tag className="h-4 w-4" />
    case 'corrective_action':
      return <CheckCircle className="h-4 w-4" />
    default:
      return <MessageSquare className="h-4 w-4" />
  }
}

const getActivityMessage = (activity: IncidentActivity) => {
  switch (activity.action_type) {
    case 'created':
      return 'がインシデントを作成しました'
    case 'status_change':
      return `がステータスを ${activity.old_value} から ${activity.new_value} に変更しました`
    case 'assignment':
      return activity.new_value
        ? `が ${activity.new_value} を担当者に設定しました`
        : '担当者を解除しました'
    case 'label_added':
      return `がラベル "${activity.new_value}" を追加しました`
    case 'label_removed':
      return `がラベル "${activity.old_value}" を削除しました`
    case 'corrective_action':
      return '是正措置を追加しました'
    default:
      return activity.content || ''
  }
}

export function IncidentTimeline({
  activities,
  comments,
  onAddComment,
}: IncidentTimelineProps) {
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // アクティビティとコメントを統合してソート
  const timelineItems: TimelineItem[] = [
    ...activities.map((activity) => ({
      id: `activity-${activity.id}`,
      type: 'activity' as const,
      user_name: activity.user_name,
      created_at: activity.created_at,
      activity,
    })),
    ...comments.map((comment) => ({
      id: `comment-${comment.id}`,
      type: 'comment' as const,
      user_name: comment.user_name,
      created_at: comment.created_at,
      comment,
    })),
  ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  const handleSubmit = async () => {
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      await onAddComment(newComment.trim())
      setNewComment('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {timelineItems.map((item) => (
        <div key={item.id} className="flex gap-3">
          {item.type === 'activity' && item.activity ? (
            <>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                {getActivityIcon(item.activity.action_type)}
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-slate-900">{item.user_name}</span>
                  {' '}
                  {getActivityMessage(item.activity)}
                  {' '}
                  <span className="text-xs">
                    {formatDistanceToNow(new Date(item.created_at), {
                      addSuffix: true,
                      locale: ja,
                    })}
                  </span>
                </p>
                {item.activity.content && item.activity.action_type === 'corrective_action' && (
                  <div className="mt-2 rounded-lg border border-border/60 bg-muted/30 p-3 text-sm">
                    {item.activity.content}
                  </div>
                )}
              </div>
            </>
          ) : item.type === 'comment' && item.comment ? (
            <>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                {item.user_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="rounded-lg border border-border/60 bg-white">
                  <div className="border-b border-border/60 px-4 py-2">
                    <span className="font-semibold text-sm text-slate-900">
                      {item.user_name}
                    </span>
                    {' '}
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.created_at), {
                        addSuffix: true,
                        locale: ja,
                      })}
                    </span>
                  </div>
                  <div className="px-4 py-3 text-sm text-slate-900 whitespace-pre-wrap">
                    {item.comment.content}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      ))}

      {/* 新規コメント入力 */}
      <div className="flex gap-3 pt-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600">
          <MessageSquare className="h-4 w-4" />
        </div>
        <div className="flex-1 space-y-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="コメントを追加..."
            className="min-h-[100px]"
            disabled={isSubmitting}
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!newComment.trim() || isSubmitting}
              size="sm"
            >
              {isSubmitting ? 'コメント中...' : 'コメント'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
