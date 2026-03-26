import { z } from 'zod'

export const roleSchema = z.enum(['leader', 'worker', 'safety_manager'])

export const workStatusSchema = z.enum(['draft', 'confirmed'])

export const riskLevelSchema = z.enum(['low', 'medium', 'high'])

export const incidentStatusSchema = z.enum(['open', 'resolved'])

export const incidentTypeSchema = z.enum(['incident', 'near_miss'])

export const userSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  role: roleSchema,
  is_active: z.boolean(),
  contact: z.string().nullable().optional(),
})

export const workGroupSchema = z.object({
  id: z.number().int(),
  name: z.string(),
})

export const coordinatesSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
})