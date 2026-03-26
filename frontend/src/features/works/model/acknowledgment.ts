export interface AcknowledgmentRiskItem {
  id: number
  source: 'manual' | 'ai'
  content: string
  action: string | null
  itemName: string
  riskKey: string
}