import type { Comment } from '@/types/api'
import { request } from './client'

export const fetchComments = (workId: number) =>
  request<Comment[]>(`/works/${workId}/comments`, {}, false)

export const addComment = (workId: number, content: string) =>
  request<Comment>(`/works/${workId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  })
