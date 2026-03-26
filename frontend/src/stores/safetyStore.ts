import { create } from 'zustand'

interface SafetyState {
  signatureData: string | null
  acknowledgedRisks: Set<string>
  error: string | null

  setSignature(data: string): void
  acknowledgeRisk(riskKey: string): void
  unacknowledgeRisk(riskKey: string): void
  resetForm(): void
}

export const useSafetyStore = create<SafetyState>((set, get) => ({
  signatureData: null,
  acknowledgedRisks: new Set(),
  error: null,

  setSignature: (data) => {
    set({ signatureData: data })
  },

  acknowledgeRisk: (riskKey) => {
    set((state) => {
      const newSet = new Set(state.acknowledgedRisks)
      newSet.add(riskKey)
      return { acknowledgedRisks: newSet }
    })
  },

  unacknowledgeRisk: (riskKey) => {
    set((state) => {
      const newSet = new Set(state.acknowledgedRisks)
      newSet.delete(riskKey)
      return { acknowledgedRisks: newSet }
    })
  },

  resetForm: () => {
    set({
      signatureData: null,
      acknowledgedRisks: new Set(),
      error: null,
    })
  },
}))
