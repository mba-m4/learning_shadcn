import type { Manual } from '@/types/api'
import { request } from '@/shared/api/client'
import { manualSchema, manualsSchema } from '@/shared/api/schemas/support'

export const fetchManuals = () =>
	request<Manual[]>('/manuals', undefined, true, manualsSchema)

export const fetchManual = (manualId: number) =>
	request<Manual>(`/manuals/${manualId}`, undefined, true, manualSchema)