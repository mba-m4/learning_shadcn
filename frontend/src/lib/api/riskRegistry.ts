import type { RiskRecord } from '@/types/api'
import { request } from './client'

export const fetchRisks = () => request<RiskRecord[]>('/risks')

export const fetchRisk = (riskId: number) =>
  request<RiskRecord>(`/risks/${riskId}`)

export const updateRiskStatus = (riskId: number, status: RiskRecord['status']) =>
  request<RiskRecord>(`/risks/${riskId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })

export const updateRiskSeverity = (
  riskId: number,
  severity: RiskRecord['severity'],
) =>
  request<RiskRecord>(`/risks/${riskId}/severity`, {
    method: 'PATCH',
    body: JSON.stringify({ severity }),
  })

export const addRiskAction = (riskId: number, action: string) =>
  request<RiskRecord>(`/risks/${riskId}/actions`, {
    method: 'POST',
    body: JSON.stringify({ action }),
  })
