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