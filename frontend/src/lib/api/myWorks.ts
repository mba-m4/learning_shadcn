import type { MyWork, WorkAsset, MyWorkListResponse } from '@/types/api'
import { request } from './client'

export const fetchMyWorks = (params?: {
  limit?: number
  offset?: number
}) => {
  const query = new URLSearchParams()
  if (params?.limit) query.set('limit', String(params.limit))
  if (params?.offset) query.set('offset', String(params.offset))

  const queryString = query.toString()
  return request<MyWorkListResponse>(`/my-works${queryString ? `?${queryString}` : ''}`)
}

export const fetchMyWork = (workId: number) =>
  request<MyWork>(`/my-works/${workId}`)

export const fetchWorkAssets = (workId: number) =>
  request<WorkAsset>(`/my-works/${workId}/assets`)

export const addWorkPhotos = (workId: number, files: string[]) =>
  request<WorkAsset>(`/my-works/${workId}/assets/photos`, {
    method: 'POST',
    body: JSON.stringify({ files }),
  })

export const addWorkAudios = (workId: number, files: string[]) =>
  request<WorkAsset>(`/my-works/${workId}/assets/audios`, {
    method: 'POST',
    body: JSON.stringify({ files }),
  })

export const addWorkNote = (workId: number, note: string) =>
  request<WorkAsset>(`/my-works/${workId}/assets/notes`, {
    method: 'POST',
    body: JSON.stringify({ note }),
  })
