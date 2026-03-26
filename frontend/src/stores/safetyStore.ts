import { create } from 'zustand'
import { ApiError, request } from '@/lib/api/client'
import { toast } from 'sonner'

interface WorkRiskAcknowledgment {
  id: number
  work_id: number
  user_id: number
  acknowledged_at: string
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

export interface AcknowledgedRiskSnapshot {
  id: number
  source: 'ai' | 'manual'
  content: string
  action?: string | null
  item_name?: string | null
}

interface SafetyState {
  acknowledgments: Record<number, WorkRiskAcknowledgment>
  signatureData: string | null
  acknowledgedRisks: Set<string>
  loading: boolean
  error: string | null

  setSignature(data: string): void
  acknowledgeRisk(riskKey: string): void
  unacknowledgeRisk(riskKey: string): void
  submitAcknowledgment(
    workId: number,
    acknowledgedRisks: AcknowledgedRiskSnapshot[]
  ): Promise<WorkRiskAcknowledgment>
  fetchAcknowledgment(workId: number): Promise<void>
  fetchAcknowledgmentHistory(workId: number): Promise<WorkRiskAcknowledgment[]>
  resetForm(): void
}

export const useSafetyStore = create<SafetyState>((set, get) => ({
  acknowledgments: {},
  signatureData: null,
  acknowledgedRisks: new Set(),
  loading: false,
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

  submitAcknowledgment: async (workId, acknowledgedRisksSnapshot) => {
    const { signatureData, acknowledgedRisks } = get()

    if (acknowledgedRisks.size === 0) {
      const message = '最低1つのリスクを確認してください'
      set({ error: message })
      throw new Error(message)
    }

    set({ loading: true, error: null })

    try {
      const data = await request<WorkRiskAcknowledgment>(
        `/works/${workId}/acknowledge`,
        {
          method: 'POST',
          body: JSON.stringify({
            signature_base64: signatureData,
            acknowledged_risk_ids: acknowledgedRisksSnapshot.map((risk) => risk.id),
            acknowledged_risks: acknowledgedRisksSnapshot,
          }),
        }
      )

      set((state) => ({
        acknowledgments: { ...state.acknowledgments, [workId]: data },
        signatureData: null,
        acknowledgedRisks: new Set(),
        loading: false,
      }))

      toast.success('✓ リスク確認が完了しました')
      return data
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      set({ loading: false, error: errorMsg })
      toast.error('確認に失敗しました: ' + errorMsg)
      throw err
    }
  },

  fetchAcknowledgment: async (workId) => {
    set({ loading: true, error: null })
    try {
      const data = await request<WorkRiskAcknowledgment | null>(
        `/works/${workId}/acknowledgment`
      )
      if (data) {
        set((state) => ({
          acknowledgments: { ...state.acknowledgments, [workId]: data },
          loading: false,
        }))
      } else {
        set({ loading: false })
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        set((state) => {
          const next = { ...state.acknowledgments }
          delete next[workId]
          return { acknowledgments: next, loading: false }
        })
        return
      }
      set({ loading: false })
    }
  },

  fetchAcknowledgmentHistory: async (workId) => {
    set({ loading: true, error: null })
    try {
      const data = await request<WorkRiskAcknowledgment[]>(
        `/works/${workId}/acknowledgments/history`
      )
      set({ loading: false })
      return data
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      set({ loading: false, error: errorMsg })
      throw err
    }
  },

  resetForm: () => {
    set({
      signatureData: null,
      acknowledgedRisks: new Set(),
      error: null,
    })
  },
}))
