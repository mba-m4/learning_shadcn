import { z } from 'zod'
import { incidentSchema } from './incidents'
import {
  manualRisksSchema,
  manualsSchema,
  workCommentsSchema,
  workRiskAcknowledgmentSchema,
} from './support'
import { riskLevelSchema, workGroupSchema, workStatusSchema } from './shared'

export const workSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  description: z.string(),
  group_id: z.number().int(),
  work_date: z.string(),
  status: workStatusSchema,
})

export const workItemSchema = z.object({
  id: z.number().int(),
  work_id: z.number().int(),
  name: z.string(),
  description: z.string(),
})

export const riskAssessmentSchema = z.object({
  id: z.number().int(),
  work_item_id: z.number().int(),
  title: z.string().nullable().optional(),
  content: z.string(),
  severity: riskLevelSchema.nullable().optional(),
  risk_level: riskLevelSchema.nullable().optional(),
  action: z.string().nullable().optional(),
  generated_at: z.string(),
})

export const workItemWithRisksSchema = z.object({
  item: workItemSchema,
  risks: z.array(riskAssessmentSchema),
})

export const workOverviewSchema = z.object({
  work: workSchema,
  items: z.array(workItemWithRisksSchema),
})

export const workListItemSchema = z.object({
  work: workSchema,
  items: z.array(workItemSchema),
  risk_count: z.number().int(),
})

export const workListResponseSchema = z.object({
  items: z.array(workListItemSchema),
  total: z.number().int(),
  limit: z.number().int(),
  offset: z.number().int(),
})

export const workDateSummarySchema = z.object({
  work_date: z.string(),
  count: z.number().int(),
})

export const workSceneVector3Schema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
})

export const workSceneCameraSchema = z.object({
  position: workSceneVector3Schema,
  target: workSceneVector3Schema,
  fov: z.number().optional(),
})

export const workSceneTransformSchema = z.object({
  scale: z.number(),
  offset: workSceneVector3Schema.nullable().optional(),
})

export const workSceneAnnotationSchema = z.object({
  id: z.string(),
  item_id: z.number().int().optional(),
  risk_id: z.number().int().optional(),
  kind: z.enum(['work', 'risk']),
  title: z.string(),
  description: z.string(),
  position: workSceneVector3Schema.nullable(),
  size: z.number().optional(),
  severity: riskLevelSchema.nullable().optional(),
  source: z.enum(['ai', 'manual']).nullable().optional(),
  steps: z.array(z.string()).optional(),
})

export const workSceneAssetSchema = z.object({
  work_id: z.number().int(),
  model_name: z.string(),
  model_url: z.string(),
  coordinate_system: z.literal('model-origin'),
  camera: workSceneCameraSchema.nullable().optional(),
  transform: workSceneTransformSchema.nullable().optional(),
  annotations: z.array(workSceneAnnotationSchema),
})

export const workDetailPageSchema = z.object({
  work: workOverviewSchema,
  scene: workSceneAssetSchema.nullable(),
  comments: workCommentsSchema,
  acknowledgment: workRiskAcknowledgmentSchema.nullable(),
  manual_risks_by_item_id: z.record(z.string(), manualRisksSchema).transform((entries) =>
    Object.fromEntries(
      Object.entries(entries).map(([itemId, risks]) => [Number(itemId), risks]),
    ),
  ),
  related_incidents: z.array(incidentSchema),
  related_manuals: manualsSchema,
})

export const createWorkRiskPayloadSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  severity: riskLevelSchema.optional(),
  risk_level: riskLevelSchema.optional(),
  action: z.string().min(1).optional(),
})

export const createWorkPayloadSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  group_id: z.number().int(),
  work_date: z.string(),
  status: workStatusSchema,
  items: z.array(
    z.object({
      name: z.string().min(1),
      description: z.string(),
      risks: z.array(createWorkRiskPayloadSchema).optional(),
    }),
  ).optional(),
})

export const createWorkItemPayloadSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  risks: z.array(createWorkRiskPayloadSchema).optional(),
})

export const workListParamsSchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  limit: z.number().int().optional(),
  offset: z.number().int().optional(),
})

export const workDateSummaryParamsSchema = z.object({
  start_date: z.string(),
  end_date: z.string(),
})

export const workGroupsResponseSchema = z.array(workGroupSchema)
export const workOverviewListSchema = z.array(workOverviewSchema)
export const workDateSummaryListSchema = z.array(workDateSummarySchema)

export const riskSummarySchema = z.object({
  work_id: z.number().int(),
  level: riskLevelSchema,
  score: z.number(),
  reasons: z.array(z.string()).optional(),
  updated_at: z.string().optional(),
})