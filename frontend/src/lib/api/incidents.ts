import type { Incident, IncidentComment, IncidentActivity, User } from '@/types/api'
import { request } from './client'
import {
  createIncidentPayloadSchema,
  incidentActivitiesSchema,
  incidentCommentsSchema,
  incidentListSchema,
  incidentSchema,
  usersResponseSchema,
} from './schemas/incidents'

export const fetchIncidents = () =>
  request<Incident[]>('/incidents', undefined, true, incidentListSchema)

export const fetchIncident = (incidentId: number) =>
  request<Incident>(`/incidents/${incidentId}`, undefined, true, incidentSchema)

export const updateIncidentStatus = (
  incidentId: number,
  status: Incident['status'],
) =>
  request<Incident>(`/incidents/${incidentId}/status`, {
    method: 'PATCH',
    body: { status },
  }, true, incidentSchema)

export const addIncidentAction = (incidentId: number, action: string) =>
  request<Incident>(`/incidents/${incidentId}/actions`, {
    method: 'POST',
    body: { action },
  }, true, incidentSchema)

export const createIncident = (payload: {
  title: string
  type: 'incident' | 'near_miss'
  date: string
  root_cause: string
  corrective_actions?: string[]
  status?: Incident['status']
  work_id?: number
  assignee_id?: number
  labels?: string[]
}): Promise<Incident> => {
  const parsedPayload = createIncidentPayloadSchema.parse(payload)

  return request<Incident>('/incidents', {
    method: 'POST',
    body: parsedPayload,
  }, true, incidentSchema)
}

export const updateIncidentAssignment = (incidentId: number, assigneeId: number | null) =>
  request<Incident>(`/incidents/${incidentId}/assignment`, {
    method: 'PATCH',
    body: { assignee_id: assigneeId },
  }, true, incidentSchema)

export const addIncidentLabel = (incidentId: number, label: string) =>
  request<Incident>(`/incidents/${incidentId}/labels`, {
    method: 'POST',
    body: { label },
  }, true, incidentSchema)

export const removeIncidentLabel = (incidentId: number, label: string) =>
  request<Incident>(`/incidents/${incidentId}/labels/${encodeURIComponent(label)}`, {
    method: 'DELETE',
  }, true, incidentSchema)

// コメント関連
export const fetchIncidentComments = (incidentId: number) =>
  request<IncidentComment[]>(
    `/incidents/${incidentId}/comments`,
    undefined,
    true,
    incidentCommentsSchema,
  )

export const addIncidentComment = (incidentId: number, content: string) =>
  request<IncidentComment>(`/incidents/${incidentId}/comments`, {
    method: 'POST',
    body: { content },
  }, true, incidentCommentsSchema.element)

export const updateIncidentComment = (incidentId: number, commentId: number, content: string) =>
  request<IncidentComment>(`/incidents/${incidentId}/comments/${commentId}`, {
    method: 'PATCH',
    body: { content },
  }, true, incidentCommentsSchema.element)

export const deleteIncidentComment = (incidentId: number, commentId: number) =>
  request<void>(`/incidents/${incidentId}/comments/${commentId}`, {
    method: 'DELETE',
  })

// アクティビティタイムライン
export const fetchIncidentActivities = (incidentId: number) =>
  request<IncidentActivity[]>(
    `/incidents/${incidentId}/activities`,
    undefined,
    true,
    incidentActivitiesSchema,
  )

// ユーザー一覧（アサイン用）
export const fetchUsers = () =>
  request<User[]>('/users', undefined, true, usersResponseSchema)
