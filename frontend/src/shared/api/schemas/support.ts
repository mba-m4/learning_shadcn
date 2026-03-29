import { z } from 'zod'
import { coordinatesSchema, riskLevelSchema } from './shared'

export const workCommentSchema = z.object({
  id: z.number().int(),
  work_id: z.number().int(),
  user_id: z.number().int(),
  content: z.string(),
  created_at: z.string(),
})

export const workCommentsSchema = z.array(workCommentSchema)

export const manualRiskSchema = z.object({
  id: z.number().int(),
  work_item_id: z.number().int(),
  title: z.string().nullable().optional(),
  content: z.string(),
  severity: riskLevelSchema.nullable().optional(),
  risk_level: riskLevelSchema.nullable().optional(),
  action: z.string().nullable().optional(),
  created_at: z.string(),
})

export const manualRisksSchema = z.array(manualRiskSchema)

export const riskSummarySchema = z.object({
  work_id: z.number().int(),
  level: riskLevelSchema,
  score: z.number(),
  reasons: z.array(z.string()).optional(),
  updated_at: z.string().optional(),
})

export const riskRecordSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  severity: z.enum(['low', 'medium', 'high']),
  status: z.enum(['open', 'in_review', 'closed']),
  work_id: z.number().int().nullable().optional(),
  work_title: z.string().nullable().optional(),
  summary: z.string(),
  actions: z.array(z.string()),
  location_coordinates: coordinatesSchema.nullable().optional(),
})

export const riskRecordsSchema = z.array(riskRecordSchema)

export const notificationTypeSchema = z.enum(['info', 'warning', 'urgent', 'success'])

export const notificationSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  content: z.string(),
  type: notificationTypeSchema,
  created_at: z.string(),
  is_read: z.boolean().optional(),
  link: z.string().optional(),
  display_until: z.string().nullable().optional(),
  pinned: z.boolean().optional(),
})

export const notificationsSchema = z.array(notificationSchema)

export const createNotificationPayloadSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  type: notificationTypeSchema,
  link: z.string().optional(),
  display_until: z.string().nullable().optional(),
  pinned: z.boolean().optional(),
})

export const manualSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  category: z.string(),
  updated_at: z.string(),
  summary: z.string(),
})

export const manualsSchema = z.array(manualSchema)

export const meetingUploadSchema = z.object({
  id: z.number().int(),
  meeting_id: z.number().int().nullable().optional(),
  filename: z.string(),
  created_at: z.string(),
})

export const meetingUploadsSchema = z.array(meetingUploadSchema)

export const meetingSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  date: z.string(),
  participants: z.array(z.string()),
  transcript: z.string(),
  extracted_risks: riskRecordsSchema,
  sync_state: z.string(),
})

export const meetingsSchema = z.array(meetingSchema)

export const addMeetingUploadsPayloadSchema = z.object({
  meeting_id: z.number().int().nullable().optional(),
  files: z.array(z.string()).min(1),
})

export const myWorkLocationSchema = z.object({
  id: z.number().int(),
  work_id: z.number().int(),
  name: z.string(),
  map_type: z.enum(['image', '3d']),
  map_file_path: z.string(),
  coordinates: coordinatesSchema,
  description: z.string().nullable().optional(),
})

export const myWorkItemSchema = z.object({
  id: z.number().int(),
  work_id: z.number().int(),
  title: z.string(),
  status: z.enum(['pending', 'in_progress', 'completed']),
  steps: z.array(z.string()),
  hazards: z.array(z.string()),
  tools: z.array(z.string()),
})

export const myWorkSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  description: z.string(),
  work_date: z.string(),
  group: z.string(),
  status: z.enum(['pending', 'in_progress', 'completed']),
  risk_score: z.number(),
  items: z.array(myWorkItemSchema),
  related_risks: riskRecordsSchema,
  incidents: z.array(z.string()),
  location: myWorkLocationSchema.nullable().optional(),
})

export const myWorkListResponseSchema = z.object({
  items: z.array(myWorkSchema),
  total: z.number().int(),
  limit: z.number().int(),
  offset: z.number().int(),
})

export const workAssetSchema = z.object({
  photos: z.array(z.string()),
  audios: z.array(z.string()),
  notes: z.array(z.string()),
})

export const workFilesPayloadSchema = z.object({
  files: z.array(z.string()).min(1),
})

export const workNotePayloadSchema = z.object({
  note: z.string().min(1),
})

export const configCatalogSchema = z.object({
  incidentStatuses: z.array(z.string()),
  incidentTypes: z.array(z.string()),
  incidentLabels: z.array(z.string()),
  riskSeverities: z.array(z.string()),
  riskStatuses: z.array(z.string()),
  workStatuses: z.array(z.string()),
  notificationTypes: z.array(notificationTypeSchema),
})

export const acknowledgedRiskSnapshotSchema = z.object({
  id: z.number().int(),
  source: z.enum(['ai', 'manual']),
  content: z.string(),
  action: z.string().nullable().optional(),
  item_name: z.string().nullable().optional(),
})

export const workRiskAcknowledgmentSchema = z.object({
  id: z.number().int(),
  work_id: z.number().int(),
  user_id: z.number().int(),
  acknowledged_at: z.string(),
  signature_base64: z.string().nullable(),
  acknowledged_risk_ids: z.array(z.number().int()),
  acknowledged_risks: z.array(acknowledgedRiskSnapshotSchema),
})

export const workRiskAcknowledgmentHistorySchema = z.array(workRiskAcknowledgmentSchema)

export const submitAcknowledgmentPayloadSchema = z.object({
  signature_base64: z.string().nullable(),
  acknowledged_risk_ids: z.array(z.number().int()).min(1),
  acknowledged_risks: z.array(acknowledgedRiskSnapshotSchema).min(1),
})