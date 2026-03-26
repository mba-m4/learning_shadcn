import type { Manual } from '@/types/api'
import { request } from './client'
import { manualSchema, manualsSchema } from './schemas/support'

export const fetchManuals = () => request<Manual[]>('/manuals', undefined, true, manualsSchema)

export const fetchManual = (manualId: number) =>
  request<Manual>(`/manuals/${manualId}`, undefined, true, manualSchema)
