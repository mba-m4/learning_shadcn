import type { RiskLevel, RiskSource, WorkStatus } from './common'

export interface WorkGroup {
  id: number
  name: string
}

export interface Work {
  id: number
  title: string
  description: string
  group_id: number
  work_date: string
  status: WorkStatus
}

export interface WorkItem {
  id: number
  work_id: number
  name: string
  description: string
}

export interface RiskAssessment {
  id: number
  work_item_id: number
  content: string
  action?: string | null
  generated_at: string
}

export interface ManualRisk {
  id: number
  work_item_id: number
  content: string
  action?: string | null
  created_at: string
}

export interface WorkComment {
  id: number
  work_id: number
  user_id: number
  content: string
  created_at: string
}

export interface RiskSummary {
  work_id: number
  level: RiskLevel
  score: number
  reasons?: string[]
  updated_at?: string
}

export interface RiskDisplay {
  id: string
  content: string
  source: RiskSource
  timestamp: string
  action?: string | null
}

export interface WorkItemWithRisks {
  item: WorkItem
  risks: RiskAssessment[]
}

export interface WorkOverview {
  work: Work
  items: WorkItemWithRisks[]
}

export interface WorkListItem {
  work: Work
  items: WorkItem[]
  risk_count: number
}

export interface WorkListResponse {
  items: WorkListItem[]
  total: number
  limit: number
  offset: number
}

export type WorkListPage = WorkListResponse

export interface WorkDateSummary {
  work_date: string
  count: number
}

export interface WorkRiskAcknowledgment {
  id: number
  work_id: number
  user_id: number
  acknowledged_at: string
  signature_base64: string | null
  acknowledged_risk_ids: number[]
  acknowledged_risks: Array<{
    id: number
    source: 'ai' | 'manual'
    content: string
    action?: string | null
    item_name?: string | null
  }>
}

export interface AuditLog {
  id: number
  action: string
  user_id: number
  work_id: number | null
  details: string | null
  timestamp: string
}