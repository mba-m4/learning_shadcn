import { z } from 'zod'
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
  content: z.string(),
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

export const createWorkPayloadSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  group_id: z.number().int(),
  work_date: z.string(),
  status: workStatusSchema,
})

export const createWorkItemPayloadSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
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