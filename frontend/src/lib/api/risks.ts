import type { ManualRisk, RiskAssessment, RiskSummary } from '@/types/api'
import { request } from './client'

export const fetchManualRisks = (workItemId: number) =>
  request<ManualRisk[]>(`/works/items/${workItemId}/risks/manual`)

export const createManualRisk = (
  workItemId: number,
  content: string,
  action?: string | null,
) =>
  request<ManualRisk>(`/works/items/${workItemId}/risks/manual`, {
    method: 'POST',
    body: JSON.stringify({ content, action }),
  })

export const updateManualRisk = (
  riskId: number,
  payload: { content?: string | null; action?: string | null },
) =>
  request<ManualRisk>(`/works/items/risks/manual/${riskId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

export const deleteManualRisk = (riskId: number) =>
  request<{ deleted: boolean }>(`/works/items/risks/manual/${riskId}`, {
    method: 'DELETE',
  })

export const updateRiskAssessment = (
  riskId: number,
  payload: { content?: string | null; action?: string | null },
) =>
  request<RiskAssessment>(`/works/items/risks/ai/${riskId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

export const deleteRiskAssessment = (riskId: number) =>
  request<{ deleted: boolean }>(`/works/items/risks/ai/${riskId}`, {
    method: 'DELETE',
  })

export const fetchRiskSummary = (workId: number) =>
  request<RiskSummary>(`/works/${workId}/risk-summary`)
