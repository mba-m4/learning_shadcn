import type { Coordinates } from './common'
import type { RiskRecord } from './riskRegistry'

export interface MyWorkLocation {
  id: number
  work_id: number
  name: string
  map_type: 'image' | '3d'
  map_file_path: string
  coordinates: Coordinates
  description?: string | null
}

export interface MyWorkItem {
  id: number
  work_id: number
  title: string
  status: 'pending' | 'in_progress' | 'completed'
  steps: string[]
  hazards: string[]
  tools: string[]
}

export interface MyWork {
  id: number
  title: string
  description: string
  work_date: string
  group: string
  status: 'pending' | 'in_progress' | 'completed'
  risk_score: number
  items: MyWorkItem[]
  related_risks: RiskRecord[]
  incidents: string[]
  location?: MyWorkLocation | null
}

export interface WorkAsset {
  photos: string[]
  audios: string[]
  notes: string[]
}

export interface MyWorkListResponse {
  items: MyWork[]
  total: number
  limit: number
  offset: number
}