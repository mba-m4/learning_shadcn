import { z } from 'zod'
import { incidentStatusSchema, incidentTypeSchema, userSchema } from './shared'

export const incidentSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  type: incidentTypeSchema,
  date: z.string(),
  root_cause: z.string(),
  corrective_actions: z.array(z.string()),
  status: incidentStatusSchema,
  work_id: z.number().int().nullable().optional(),
  work_title: z.string().nullable().optional(),
  assignee_id: z.number().int().nullable().optional(),
  assignee_name: z.string().nullable().optional(),
  labels: z.array(z.string()).default([]),
  created_at: z.string(),
  updated_at: z.string(),
})

export const incidentCommentSchema = z.object({
  id: z.number().int(),
  incident_id: z.number().int(),
  user_id: z.number().int(),
  user_name: z.string(),
  content: z.string(),
  created_at: z.string(),
  updated_at: z.string().optional(),
})

export const incidentActivitySchema = z.object({
  id: z.number().int(),
  incident_id: z.number().int(),
  user_id: z.number().int(),
  user_name: z.string(),
  action_type: z.enum([
    'created',
    'comment',
    'status_change',
    'corrective_action',
    'assignment',
    'label_added',
    'label_removed',
  ]),
  content: z.string().optional(),
  old_value: z.string().optional(),
  new_value: z.string().optional(),
  created_at: z.string(),
})

export const createIncidentPayloadSchema = z.object({
  title: z.string().min(1),
  type: incidentTypeSchema,
  date: z.string(),
  root_cause: z.string().min(1),
  corrective_actions: z.array(z.string()).optional(),
  status: incidentStatusSchema.optional(),
  work_id: z.number().int().optional(),
  assignee_id: z.number().int().optional(),
  labels: z.array(z.string()).optional(),
})

export const incidentListSchema = z.array(incidentSchema)
export const incidentCommentsSchema = z.array(incidentCommentSchema)
export const incidentActivitiesSchema = z.array(incidentActivitySchema)
export const usersResponseSchema = z.array(userSchema)