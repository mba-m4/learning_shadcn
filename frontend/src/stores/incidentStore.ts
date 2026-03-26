import { create } from 'zustand'
import type { Incident, IncidentComment, IncidentActivity, User } from '@/types/api'
import {
  addIncidentAction,
  addIncidentComment,
  addIncidentLabel,
  createIncident,
  fetchIncident,
  fetchIncidentActivities,
  fetchIncidentComments,
  fetchIncidents,
  fetchUsers,
  removeIncidentLabel,
  updateIncidentAssignment,
  updateIncidentStatus,
} from '@/lib/api/incidents'
import { getErrorMessage } from '@/lib/api/client'

interface IncidentState {
  incidents: Incident[]
  comments: Record<number, IncidentComment[]>
  activities: Record<number, IncidentActivity[]>
  users: User[]
  loading: boolean
  error: string | null
  fetchIncidents: () => Promise<void>
  fetchIncident: (incidentId: number) => Promise<Incident | null>
  updateStatus: (incidentId: number, status: Incident['status']) => Promise<Incident | null>
  addAction: (incidentId: number, action: string) => Promise<Incident | null>
  createIncident: (payload: {
    title: string
    type: 'incident' | 'near_miss'
    date: string
    root_cause: string
    corrective_actions?: string[]
    status?: Incident['status']
    work_id?: number
    assignee_id?: number
    labels?: string[]
  }) => Promise<Incident | null>
  updateAssignment: (incidentId: number, assigneeId: number | null) => Promise<Incident | null>
  addLabel: (incidentId: number, label: string) => Promise<Incident | null>
  removeLabel: (incidentId: number, label: string) => Promise<Incident | null>
  fetchComments: (incidentId: number) => Promise<void>
  addComment: (incidentId: number, content: string) => Promise<IncidentComment | null>
  fetchActivities: (incidentId: number) => Promise<void>
  fetchUsers: () => Promise<void>
}

const upsertIncident = (incidents: Incident[], next: Incident) => {
  const index = incidents.findIndex((incident) => incident.id === next.id)
  if (index === -1) {
    return [next, ...incidents]
  }
  const updated = [...incidents]
  updated[index] = next
  return updated
}

export const useIncidentStore = create<IncidentState>((set, get) => ({
  incidents: [],
  comments: {},
  activities: {},
  users: [],
  loading: false,
  error: null,
  fetchIncidents: async () => {
    set({ loading: true, error: null })
    try {
      const data = await fetchIncidents()
      set({ incidents: data, loading: false })
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error) })
    }
  },
  fetchIncident: async (incidentId) => {
    try {
      const incident = await fetchIncident(incidentId)
      set((state) => ({ incidents: upsertIncident(state.incidents, incident) }))
      return incident
    } catch (error) {
      set({ error: getErrorMessage(error) })
      return null
    }
  },
  updateStatus: async (incidentId, status) => {
    try {
      const incident = await updateIncidentStatus(incidentId, status)
      set((state) => ({ incidents: upsertIncident(state.incidents, incident) }))
      // アクティビティを再取得
      void get().fetchActivities(incidentId)
      return incident
    } catch (error) {
      set({ error: getErrorMessage(error) })
      return null
    }
  },
  addAction: async (incidentId, action) => {
    try {
      const incident = await addIncidentAction(incidentId, action)
      set((state) => ({ incidents: upsertIncident(state.incidents, incident) }))
      // アクティビティを再取得
      void get().fetchActivities(incidentId)
      return incident
    } catch (error) {
      set({ error: getErrorMessage(error) })
      return null
    }
  },
  createIncident: async (payload) => {
    try {
      const incident = await createIncident(payload)
      set((state) => ({ incidents: upsertIncident(state.incidents, incident) }))
      return incident
    } catch (error) {
      set({ error: getErrorMessage(error) })
      return null
    }
  },
  updateAssignment: async (incidentId, assigneeId) => {
    try {
      const incident = await updateIncidentAssignment(incidentId, assigneeId)
      set((state) => ({ incidents: upsertIncident(state.incidents, incident) }))
      // アクティビティを再取得
      void get().fetchActivities(incidentId)
      return incident
    } catch (error) {
      set({ error: getErrorMessage(error) })
      return null
    }
  },
  addLabel: async (incidentId, label) => {
    try {
      const incident = await addIncidentLabel(incidentId, label)
      set((state) => ({ incidents: upsertIncident(state.incidents, incident) }))
      // アクティビティを再取得
      void get().fetchActivities(incidentId)
      return incident
    } catch (error) {
      set({ error: getErrorMessage(error) })
      return null
    }
  },
  removeLabel: async (incidentId, label) => {
    try {
      const incident = await removeIncidentLabel(incidentId, label)
      set((state) => ({ incidents: upsertIncident(state.incidents, incident) }))
      // アクティビティを再取得
      void get().fetchActivities(incidentId)
      return incident
    } catch (error) {
      set({ error: getErrorMessage(error) })
      return null
    }
  },
  fetchComments: async (incidentId) => {
    try {
      const comments = await fetchIncidentComments(incidentId)
      set((state) => ({
        comments: { ...state.comments, [incidentId]: comments },
      }))
    } catch (error) {
      set({ error: getErrorMessage(error) })
    }
  },
  addComment: async (incidentId, content) => {
    try {
      const comment = await addIncidentComment(incidentId, content)
      set((state) => ({
        comments: {
          ...state.comments,
          [incidentId]: [...(state.comments[incidentId] || []), comment],
        },
      }))
      // アクティビティを再取得
      void get().fetchActivities(incidentId)
      return comment
    } catch (error) {
      set({ error: getErrorMessage(error) })
      return null
    }
  },
  fetchActivities: async (incidentId) => {
    try {
      const activities = await fetchIncidentActivities(incidentId)
      set((state) => ({
        activities: { ...state.activities, [incidentId]: activities },
      }))
    } catch (error) {
      set({ error: getErrorMessage(error) })
    }
  },
  fetchUsers: async () => {
    try {
      const users = await fetchUsers()
      set({ users })
    } catch (error) {
      set({ error: getErrorMessage(error) })
    }
  },
}))
