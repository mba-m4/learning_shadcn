import type { Meeting, MeetingUpload } from '@/types/api'
import { request } from './client'
import {
  addMeetingUploadsPayloadSchema,
  meetingSchema,
  meetingsSchema,
  meetingUploadsSchema,
} from './schemas/support'

export const fetchMeetings = () => request<Meeting[]>('/meetings', undefined, true, meetingsSchema)

export const fetchMeeting = (meetingId: number) =>
  request<Meeting>(`/meetings/${meetingId}`, undefined, true, meetingSchema)

export const updateMeetingSyncState = (meetingId: number, syncState: string) =>
  request<Meeting>(`/meetings/${meetingId}/sync-state`, {
    method: 'PATCH',
    body: { sync_state: syncState },
  }, true, meetingSchema)

export const fetchMeetingUploads = (meetingId?: number | null) => {
  const query = new URLSearchParams()
  if (meetingId !== undefined && meetingId !== null) {
    query.set('meeting_id', String(meetingId))
  }
  const suffix = query.toString() ? `?${query.toString()}` : ''
  return request<MeetingUpload[]>(`/meetings/uploads${suffix}`, undefined, true, meetingUploadsSchema)
}

export const addMeetingUploads = (files: string[], meetingId?: number | null) =>
  request<MeetingUpload[]>('/meetings/uploads', {
    method: 'POST',
    body: addMeetingUploadsPayloadSchema.parse({ meeting_id: meetingId ?? null, files }),
  }, true, meetingUploadsSchema)
