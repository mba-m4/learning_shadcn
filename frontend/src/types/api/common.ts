export type Role = 'leader' | 'worker' | 'safety_manager'

export type WorkStatus = 'draft' | 'confirmed'

export type RiskLevel = 'low' | 'medium' | 'high'

export type RiskSource = 'ai' | 'manual'

export interface Coordinates {
  x: number
  y: number
  width?: number
  height?: number
}