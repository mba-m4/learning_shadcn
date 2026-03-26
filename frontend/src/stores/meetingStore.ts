import { create } from 'zustand'
import type { Meeting, MeetingUpload } from '@/types/api'
import {
  addMeetingUploads,
  fetchMeeting,
  fetchMeetingUploads,
  fetchMeetings,
  updateMeetingSyncState,
} from '@/lib/api/meetings'
import { getErrorMessage } from '@/lib/api/client'

interface MeetingState {
  meetings: Meeting[]
  uploadsByKey: Record<string, MeetingUpload[]>
  loading: boolean
  error: string | null
  fetchMeetings: () => Promise<void>
  fetchMeeting: (meetingId: number) => Promise<Meeting | null>
  updateSyncState: (meetingId: number, state: string) => Promise<Meeting | null>
  fetchUploads: (meetingId?: number | null) => Promise<void>
  addUploads: (files: string[], meetingId?: number | null) => Promise<void>
}

const uploadsKey = (meetingId?: number | null) =>
  meetingId === undefined || meetingId === null ? 'general' : String(meetingId)

const upsertMeeting = (meetings: Meeting[], next: Meeting) => {
  const index = meetings.findIndex((meeting) => meeting.id === next.id)
  if (index === -1) {
    return [next, ...meetings]
  }
  const updated = [...meetings]
  updated[index] = next
  return updated
}

export const useMeetingStore = create<MeetingState>((set) => ({
  meetings: [],
  uploadsByKey: {},
  loading: false,
  error: null,
  fetchMeetings: async () => {
    set({ loading: true, error: null })
    try {
      const data = await fetchMeetings()
      set({ meetings: data, loading: false })
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error) })
    }
  },
  fetchMeeting: async (meetingId) => {
    try {
      const meeting = await fetchMeeting(meetingId)
      set((state) => ({ meetings: upsertMeeting(state.meetings, meeting) }))
      return meeting
    } catch (error) {
      set({ error: getErrorMessage(error) })
      return null
    }
  },
  updateSyncState: async (meetingId, state) => {
    try {
      const meeting = await updateMeetingSyncState(meetingId, state)
      set((current) => ({ meetings: upsertMeeting(current.meetings, meeting) }))
      return meeting
    } catch (error) {
      set({ error: getErrorMessage(error) })
      return null
    }
  },
  fetchUploads: async (meetingId) => {
    const key = uploadsKey(meetingId)
    try {
      const uploads = await fetchMeetingUploads(meetingId)
      set((state) => ({
        uploadsByKey: { ...state.uploadsByKey, [key]: uploads },
      }))
    } catch (error) {
      set({ error: getErrorMessage(error) })
    }
  },
  addUploads: async (files, meetingId) => {
    const key = uploadsKey(meetingId)
    try {
      const uploads = await addMeetingUploads(files, meetingId)
      set((state) => ({
        uploadsByKey: {
          ...state.uploadsByKey,
          [key]: [...(state.uploadsByKey[key] ?? []), ...uploads],
        },
      }))
    } catch (error) {
      set({ error: getErrorMessage(error) })
    }
  },
}))
