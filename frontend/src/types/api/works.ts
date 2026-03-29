import type { Comment } from './comments'
import type { Incident } from './incidents'
import type { Manual } from './manuals'
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
  title?: string | null
  content: string
  severity?: RiskLevel | null
  risk_level?: RiskLevel | null
  action?: string | null
  generated_at: string
}

export interface ManualRisk {
  id: number
  work_item_id: number
  title?: string | null
  content: string
  severity?: RiskLevel | null
  risk_level?: RiskLevel | null
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

export interface WorkSceneVector3 {
  x: number
  y: number
  z: number
}

export interface WorkSceneCamera {
  position: WorkSceneVector3
  target: WorkSceneVector3
  fov?: number
}

export interface WorkSceneTransform {
  scale: number
  offset?: WorkSceneVector3 | null
}

export interface WorkSceneAnnotation {
  id: string
  item_id?: number
  risk_id?: number
  kind: 'work' | 'risk'
  title: string
  description: string
  position: WorkSceneVector3 | null
  size?: number
  severity?: RiskLevel | null
  source?: RiskSource | null
  steps?: string[]
}

export interface WorkSceneAsset {
  work_id: number
  model_name: string
  model_url: string
  coordinate_system: 'model-origin'
  camera?: WorkSceneCamera | null
  transform?: WorkSceneTransform | null
  annotations: WorkSceneAnnotation[]
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

export interface WorkDetailPageData {
  work: WorkOverview
  scene: WorkSceneAsset | null
  comments: Comment[]
  acknowledgment: WorkRiskAcknowledgment | null
  manual_risks_by_item_id: Record<number, ManualRisk[]>
  related_incidents: Incident[]
  related_manuals: Manual[]
}

export interface AuditLog {
  id: number
  action: string
  user_id: number
  work_id: number | null
  details: string | null
  timestamp: string
}