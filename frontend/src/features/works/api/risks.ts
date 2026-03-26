import { z } from 'zod'
import type { ManualRisk, RiskAssessment, RiskSummary } from '@/types/api'
import { request } from '@/shared/api/client'
import { riskAssessmentSchema } from '@/shared/api/schemas/works'
import {
  manualRiskSchema,
  manualRisksSchema,
  riskSummarySchema,
} from '@/shared/api/schemas/support'

const deleteResponseSchema = z.object({ deleted: z.boolean() })

export const fetchManualRisks = (workItemId: number) =>
  request<ManualRisk[]>(
    `/works/items/${workItemId}/risks/manual`,
    undefined,
    true,
    manualRisksSchema,
  )

export const createManualRisk = (
  workItemId: number,
  content: string,
  action?: string | null,
) =>
  request<ManualRisk>(
    `/works/items/${workItemId}/risks/manual`,
    {
      method: 'POST',
      body: { content, action },
    },
    true,
    manualRiskSchema,
  )

export const updateManualRisk = (
  riskId: number,
  payload: { content?: string | null; action?: string | null },
) =>
  request<ManualRisk>(
    `/works/items/risks/manual/${riskId}`,
    {
      method: 'PATCH',
      body: payload,
    },
    true,
    manualRiskSchema,
  )

export const deleteManualRisk = (riskId: number) =>
  request<{ deleted: boolean }>(
    `/works/items/risks/manual/${riskId}`,
    {
      method: 'DELETE',
    },
    true,
    deleteResponseSchema,
  )

export const updateRiskAssessment = (
  riskId: number,
  payload: { content?: string | null; action?: string | null },
) =>
  request<RiskAssessment>(
    `/works/items/risks/ai/${riskId}`,
    {
      method: 'PATCH',
      body: payload,
    },
    true,
    riskAssessmentSchema,
  )

export const deleteRiskAssessment = (riskId: number) =>
  request<{ deleted: boolean }>(
    `/works/items/risks/ai/${riskId}`,
    {
      method: 'DELETE',
    },
    true,
    deleteResponseSchema,
  )

export const fetchRiskSummary = (workId: number) =>
  request<RiskSummary>(
    `/works/${workId}/risk-summary`,
    undefined,
    true,
    riskSummarySchema,
  )