import { create } from 'zustand'
import type { RiskRecord } from '@/types/api'
import { addRiskAction, fetchRisk, fetchRisks, updateRiskSeverity, updateRiskStatus } from '@/lib/api/riskRegistry'
import { getErrorMessage } from '@/lib/api/client'

interface RiskRegistryState {
  risks: RiskRecord[]
  loading: boolean
  error: string | null
  fetchRisks: () => Promise<void>
  fetchRisk: (riskId: number) => Promise<RiskRecord | null>
  updateStatus: (riskId: number, status: RiskRecord['status']) => Promise<RiskRecord | null>
  updateSeverity: (riskId: number, severity: RiskRecord['severity']) => Promise<RiskRecord | null>
  addAction: (riskId: number, action: string) => Promise<RiskRecord | null>
}

const upsertRisk = (risks: RiskRecord[], next: RiskRecord) => {
  const index = risks.findIndex((risk) => risk.id === next.id)
  if (index === -1) {
    return [next, ...risks]
  }
  const updated = [...risks]
  updated[index] = next
  return updated
}

export const useRiskRegistryStore = create<RiskRegistryState>((set) => ({
  risks: [],
  loading: false,
  error: null,
  fetchRisks: async () => {
    set({ loading: true, error: null })
    try {
      const data = await fetchRisks()
      set({ risks: data, loading: false })
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error) })
    }
  },
  fetchRisk: async (riskId) => {
    try {
      const risk = await fetchRisk(riskId)
      set((state) => ({ risks: upsertRisk(state.risks, risk) }))
      return risk
    } catch (error) {
      set({ error: getErrorMessage(error) })
      return null
    }
  },
  updateStatus: async (riskId, status) => {
    try {
      const risk = await updateRiskStatus(riskId, status)
      set((state) => ({ risks: upsertRisk(state.risks, risk) }))
      return risk
    } catch (error) {
      set({ error: getErrorMessage(error) })
      return null
    }
  },
  updateSeverity: async (riskId, severity) => {
    try {
      const risk = await updateRiskSeverity(riskId, severity)
      set((state) => ({ risks: upsertRisk(state.risks, risk) }))
      return risk
    } catch (error) {
      set({ error: getErrorMessage(error) })
      return null
    }
  },
  addAction: async (riskId, action) => {
    try {
      const risk = await addRiskAction(riskId, action)
      set((state) => ({ risks: upsertRisk(state.risks, risk) }))
      return risk
    } catch (error) {
      set({ error: getErrorMessage(error) })
      return null
    }
  },
}))
