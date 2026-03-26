import { create } from 'zustand'
import type { Comment } from '@/types/api'
import { addComment, fetchComments } from '@/lib/api/comments'
import { getErrorMessage } from '@/lib/api/client'

interface CommentState {
  commentsByWorkId: Record<number, Comment[]>
  loadingByWorkId: Record<number, boolean>
  errorByWorkId: Record<number, string | null>
  fetchComments: (workId: number) => Promise<void>
  addComment: (workId: number, content: string) => Promise<Comment | null>
}

export const useCommentStore = create<CommentState>((set) => ({
  commentsByWorkId: {},
  loadingByWorkId: {},
  errorByWorkId: {},
  fetchComments: async (workId) => {
    set((state) => ({
      loadingByWorkId: { ...state.loadingByWorkId, [workId]: true },
      errorByWorkId: { ...state.errorByWorkId, [workId]: null },
    }))
    try {
      const comments = await fetchComments(workId)
      set((state) => ({
        commentsByWorkId: { ...state.commentsByWorkId, [workId]: comments },
        loadingByWorkId: { ...state.loadingByWorkId, [workId]: false },
      }))
    } catch (error) {
      set((state) => ({
        loadingByWorkId: { ...state.loadingByWorkId, [workId]: false },
        errorByWorkId: {
          ...state.errorByWorkId,
          [workId]: getErrorMessage(error),
        },
      }))
    }
  },
  addComment: async (workId, content) => {
    try {
      const comment = await addComment(workId, content)
      set((state) => ({
        commentsByWorkId: {
          ...state.commentsByWorkId,
          [workId]: [comment, ...(state.commentsByWorkId[workId] || [])],
        },
      }))
      return comment
    } catch (error) {
      set((state) => ({
        errorByWorkId: {
          ...state.errorByWorkId,
          [workId]: getErrorMessage(error),
        },
      }))
      return null
    }
  },
}))
