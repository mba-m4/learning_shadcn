export type Role = 'leader' | 'worker' | 'safety_manager'

export type WorkStatus = 'draft' | 'confirmed'

export type RiskLevel = 'low' | 'medium' | 'high'

export type RiskSource = 'ai' | 'manual'

export interface User {
  id: number
  name: string
  role: Role
  is_active: boolean
  contact?: string | null
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

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

export interface MyWorkListResponse {
  items: MyWork[]
  total: number
  limit: number
  offset: number
}

export interface WorkDateSummary {
  work_date: string
  count: number
}

export interface Comment {
  id: number
  work_id: number
  user_id: number
  content: string
  created_at: string
}

export interface Coordinates {
  x: number
  y: number
  width?: number
  height?: number
}

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

export interface Incident {
  id: number
  title: string
  type: 'incident' | 'near_miss'
  date: string
  root_cause: string
  corrective_actions: string[]
  status: 'open' | 'resolved'
  work_id?: number | null
  work_title?: string | null
  assignee_id?: number | null
  assignee_name?: string | null
  labels: string[]
  created_at: string
  updated_at: string
}

export interface IncidentComment {
  id: number
  incident_id: number
  user_id: number
  user_name: string
  content: string
  created_at: string
  updated_at?: string
}

export interface IncidentActivity {
  id: number
  incident_id: number
  user_id: number
  user_name: string
  action_type: 'created' | 'comment' | 'status_change' | 'corrective_action' | 'assignment' | 'label_added' | 'label_removed'
  content?: string
  old_value?: string
  new_value?: string
  created_at: string
}

export interface IncidentLabel {
  id: string
  name: string
  color: string
  description?: string
}

export interface Manual {
  id: number
  title: string
  category: string
  updated_at: string
  summary: string
}

export interface Meeting {
  id: number
  title: string
  date: string
  participants: string[]
  transcript: string
  extracted_risks: RiskRecord[]
  sync_state: string
}

export interface MeetingUpload {
  id: number
  meeting_id?: number | null
  filename: string
  created_at: string
}

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

export interface Notification {
  id: number
  title: string
  content: string
  type: 'info' | 'warning' | 'urgent' | 'success'
  created_at: string
  is_read?: boolean
  link?: string
  display_until?: string | null
  pinned?: boolean
}
