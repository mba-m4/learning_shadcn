import type { Comment } from '@/types/api'
import { request } from '@/shared/api/client'
import {
  workCommentSchema,
  workCommentsSchema,
} from '@/shared/api/schemas/support'

export const fetchComments = (workId: number) =>
  request<Comment[]>(`/works/${workId}/comments`, undefined, true, workCommentsSchema)

export const addComment = (workId: number, content: string) =>
  request<Comment>(
    `/works/${workId}/comments`,
    {
      method: 'POST',
      body: { content },
    },
    true,
    workCommentSchema,
  )