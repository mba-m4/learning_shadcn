import { Separator } from '@/components/ui/separator'
import CommentForm from '@/components/comments/CommentForm'
import CommentList from '@/components/comments/CommentList'
import type { Comment } from '@/types/api'

interface WorkDetailCommentsSectionProps {
  canComment: boolean
  comments: Comment[]
  errorMessage?: string | null
  loading: boolean
  onAddComment: (content: string) => Promise<void>
}

export default function WorkDetailCommentsSection({
  canComment,
  comments,
  errorMessage,
  loading,
  onAddComment,
}: WorkDetailCommentsSectionProps) {
  return (
    <section className="rounded-xl border border-border/60 bg-white">
      <div className="border-b border-border/60 px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Comments
        </p>
        <h2 className="mt-2 text-xl font-semibold text-slate-900">コメント</h2>
      </div>
      <div className="space-y-4 p-6">
        {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
        <CommentList comments={comments} loading={loading} />
        <Separator className="bg-border/40" />
        <CommentForm disabled={!canComment} onSubmit={onAddComment} />
        {!canComment && (
          <p className="text-xs text-muted-foreground">コメント権限がありません。</p>
        )}
      </div>
    </section>
  )
}