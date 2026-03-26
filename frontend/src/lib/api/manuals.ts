import type { Manual } from '@/types/api'
import { request } from './client'

export const fetchManuals = () => request<Manual[]>('/manuals')

export const fetchManual = (manualId: number) =>
  request<Manual>(`/manuals/${manualId}`)
