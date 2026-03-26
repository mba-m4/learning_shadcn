import type { RiskRecord } from './riskRegistry'

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