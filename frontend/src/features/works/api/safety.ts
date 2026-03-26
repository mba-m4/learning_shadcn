import type { WorkRiskAcknowledgment } from '@/types/api'
import { ApiError, request } from '@/shared/api/client'
import {
  submitAcknowledgmentPayloadSchema,
  workRiskAcknowledgmentHistorySchema,
  workRiskAcknowledgmentSchema,
} from '@/shared/api/schemas/support'

export type SubmitAcknowledgmentPayload = {
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

export const submitAcknowledgment = (
  workId: number,
  payload: SubmitAcknowledgmentPayload,
) =>
  request<WorkRiskAcknowledgment>(
    `/works/${workId}/acknowledge`,
    {
      method: 'POST',
      body: submitAcknowledgmentPayloadSchema.parse(payload),
    },
    true,
    workRiskAcknowledgmentSchema,
  )

export const fetchAcknowledgment = async (workId: number) => {
  try {
    return await request<WorkRiskAcknowledgment>(
      `/works/${workId}/acknowledgment`,
      undefined,
      true,
      workRiskAcknowledgmentSchema,
    )
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null
    }
    throw error
  }
}

export const fetchAcknowledgmentHistory = (workId: number) =>
  request<WorkRiskAcknowledgment[]>(
    `/works/${workId}/acknowledgments/history`,
    undefined,
    true,
    workRiskAcknowledgmentHistorySchema,
  )