import type { Coordinates } from './common'

export interface RiskRecord {
  id: number
  title: string
  severity: 'low' | 'medium' | 'high'
  status: 'open' | 'in_review' | 'closed'
  work_id?: number | null
  work_title?: string | null
  summary: string
  actions: string[]
  location_coordinates?: Coordinates | null
}