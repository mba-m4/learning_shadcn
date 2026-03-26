import type { Comment } from '@/types/api'

interface CommentListProps {
  comments: Comment[]
  loading?: boolean
}

export default function CommentList({ comments, loading }: CommentListProps) {
  if (loading) {
    return <p className="text-sm text-muted-foreground">読み込み中...</p>
  }

  if (comments.length === 0) {
    return <p className="text-sm text-muted-foreground">コメントはありません。</p>
  }

  return (
    <ul className="space-y-3">
      {comments.map((comment) => (
        <li key={comment.id} className="rounded-md border p-3">
          <p className="text-sm">{comment.content}</p>
          <p className="text-xs text-muted-foreground">{comment.created_at}</p>
        </li>
      ))}
    </ul>
  )
}
