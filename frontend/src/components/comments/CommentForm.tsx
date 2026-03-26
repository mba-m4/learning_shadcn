import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface CommentFormProps {
  disabled?: boolean
  onSubmit: (content: string) => Promise<void>
}

export default function CommentForm({ disabled, onSubmit }: CommentFormProps) {
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!content.trim()) {
      return
    }
    setSubmitting(true)
    await onSubmit(content.trim())
    setContent('')
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="コメントを入力してください"
        rows={3}
        disabled={disabled || submitting}
      />
      <Button type="submit" disabled={disabled || submitting}>
        コメントを送信
      </Button>
    </form>
  )
}
