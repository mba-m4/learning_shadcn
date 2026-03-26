import { create } from 'zustand'
import type { ManualRisk, RiskSummary } from '@/types/api'
import {
  createManualRisk,
  deleteManualRisk,
  fetchManualRisks,
  fetchRiskSummary,
  updateManualRisk,
} from '@/lib/api/risks'
import { getErrorMessage } from '@/lib/api/client'

interface RiskState {
  manualRisksByItemId: Record<number, ManualRisk[]>
  loadingManualByItemId: Record<number, boolean>
  summaryByWorkId: Record<number, RiskSummary | null>
  loadingSummaryByWorkId: Record<number, boolean>
  errorByKey: Record<string, string | null>
  fetchManualRisks: (workItemId: number) => Promise<void>
  addManualRisk: (
    workItemId: number,
    content: string,
    action?: string | null
  ) => Promise<ManualRisk | null>
  updateManualRisk: (
    workItemId: number,
    riskId: number,
    payload: { content?: string | null; action?: string | null }
  ) => Promise<ManualRisk | null>
  deleteManualRisk: (workItemId: number, riskId: number) => Promise<boolean>
  fetchRiskSummary: (workId: number) => Promise<void>
}

export const useRiskStore = create<RiskState>((set) => ({
  manualRisksByItemId: {},
  loadingManualByItemId: {},
  summaryByWorkId: {},
  loadingSummaryByWorkId: {},
  errorByKey: {},
  fetchManualRisks: async (workItemId) => {
    set((state) => ({
      loadingManualByItemId: {
        ...state.loadingManualByItemId,
        [workItemId]: true,
      },
      errorByKey: { ...state.errorByKey, [`manual-${workItemId}`]: null },
    }))
    try {
      const risks = await fetchManualRisks(workItemId)
      set((state) => ({
        manualRisksByItemId: {
          ...state.manualRisksByItemId,
          [workItemId]: risks,
        },
        loadingManualByItemId: {
          ...state.loadingManualByItemId,
          [workItemId]: false,
        },
      }))
    } catch (error) {
      set((state) => ({
        loadingManualByItemId: {
          ...state.loadingManualByItemId,
          [workItemId]: false,
        },
        errorByKey: {
          ...state.errorByKey,
          [`manual-${workItemId}`]: getErrorMessage(error),
        },
      }))
    }
  },
  addManualRisk: async (workItemId, content, action) => {
    try {
      const created = await createManualRisk(workItemId, content, action)
      set((state) => ({
        manualRisksByItemId: {
          ...state.manualRisksByItemId,
          [workItemId]: [
            created,
            ...(state.manualRisksByItemId[workItemId] || []),
          ],
        },
      }))
      return created
    } catch (error) {
      set((state) => ({
        errorByKey: {
          ...state.errorByKey,
          [`manual-${workItemId}`]: getErrorMessage(error),
        },
      }))
      return null
    }
  },
  updateManualRisk: async (workItemId, riskId, payload) => {
    try {
      const updated = await updateManualRisk(riskId, payload)
      set((state) => ({
        manualRisksByItemId: {
          ...state.manualRisksByItemId,
          [workItemId]: (state.manualRisksByItemId[workItemId] || []).map(
            (risk) => (risk.id === riskId ? updated : risk),
          ),
        },
      }))
      return updated
    } catch (error) {
      set((state) => ({
        errorByKey: {
          ...state.errorByKey,
          [`manual-${workItemId}`]: getErrorMessage(error),
        },
      }))
      return null
    }
  },
  deleteManualRisk: async (workItemId, riskId) => {
    try {
      await deleteManualRisk(riskId)
      set((state) => ({
        manualRisksByItemId: {
          ...state.manualRisksByItemId,
          [workItemId]: (state.manualRisksByItemId[workItemId] || []).filter(
            (risk) => risk.id !== riskId,
          ),
        },
      }))
      return true
    } catch (error) {
      set((state) => ({
        errorByKey: {
          ...state.errorByKey,
          [`manual-${workItemId}`]: getErrorMessage(error),
        },
      }))
      return false
    }
  },
  fetchRiskSummary: async (workId) => {
    set((state) => ({
      loadingSummaryByWorkId: {
        ...state.loadingSummaryByWorkId,
        [workId]: true,
      },
      errorByKey: { ...state.errorByKey, [`summary-${workId}`]: null },
    }))
    try {
      const summary = await fetchRiskSummary(workId)
      set((state) => ({
        summaryByWorkId: { ...state.summaryByWorkId, [workId]: summary },
        loadingSummaryByWorkId: {
          ...state.loadingSummaryByWorkId,
          [workId]: false,
        },
      }))
    } catch (error) {
      set((state) => ({
        loadingSummaryByWorkId: {
          ...state.loadingSummaryByWorkId,
          [workId]: false,
        },
        errorByKey: {
          ...state.errorByKey,
          [`summary-${workId}`]: getErrorMessage(error),
        },
      }))
    }
  },
}))
