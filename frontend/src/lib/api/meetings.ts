import type { Meeting, MeetingUpload } from '@/types/api'
import { request } from './client'

export const fetchMeetings = () => request<Meeting[]>('/meetings')

export const fetchMeeting = (meetingId: number) =>
  request<Meeting>(`/meetings/${meetingId}`)

export const updateMeetingSyncState = (meetingId: number, syncState: string) =>
  request<Meeting>(`/meetings/${meetingId}/sync-state`, {
    method: 'PATCH',
    body: JSON.stringify({ sync_state: syncState }),
  })

export const fetchMeetingUploads = (meetingId?: number | null) => {
  const query = new URLSearchParams()
  if (meetingId !== undefined && meetingId !== null) {
    query.set('meeting_id', String(meetingId))
  }
  const suffix = query.toString() ? `?${query.toString()}` : ''
  return request<MeetingUpload[]>(`/meetings/uploads${suffix}`)
}

export const addMeetingUploads = (files: string[], meetingId?: number | null) =>
  request<MeetingUpload[]>('/meetings/uploads', {
    method: 'POST',
    body: JSON.stringify({ meeting_id: meetingId ?? null, files }),
  })
