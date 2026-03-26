import type { MyWork, WorkAsset, MyWorkListResponse } from '@/types/api'
import { request } from './client'
import {
  myWorkListResponseSchema,
  myWorkSchema,
  workAssetSchema,
  workFilesPayloadSchema,
  workNotePayloadSchema,
} from './schemas/support'

export const fetchMyWorks = (params?: {
  limit?: number
  offset?: number
}) => {
  const query = new URLSearchParams()
  if (params?.limit) query.set('limit', String(params.limit))
  if (params?.offset) query.set('offset', String(params.offset))

  const queryString = query.toString()
  return request<MyWorkListResponse>(
    `/my-works${queryString ? `?${queryString}` : ''}`,
    undefined,
    true,
    myWorkListResponseSchema,
  )
}

export const fetchMyWork = (workId: number) =>
  request<MyWork>(`/my-works/${workId}`, undefined, true, myWorkSchema)

export const fetchWorkAssets = (workId: number) =>
  request<WorkAsset>(`/my-works/${workId}/assets`, undefined, true, workAssetSchema)

export const addWorkPhotos = (workId: number, files: string[]) =>
  request<WorkAsset>(`/my-works/${workId}/assets/photos`, {
    method: 'POST',
    body: workFilesPayloadSchema.parse({ files }),
  }, true, workAssetSchema)

export const addWorkAudios = (workId: number, files: string[]) =>
  request<WorkAsset>(`/my-works/${workId}/assets/audios`, {
    method: 'POST',
    body: workFilesPayloadSchema.parse({ files }),
  }, true, workAssetSchema)

export const addWorkNote = (workId: number, note: string) =>
  request<WorkAsset>(`/my-works/${workId}/assets/notes`, {
    method: 'POST',
    body: workNotePayloadSchema.parse({ note }),
  }, true, workAssetSchema)
