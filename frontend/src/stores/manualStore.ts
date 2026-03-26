import { create } from 'zustand'
import type { Manual } from '@/types/api'
import { fetchManual, fetchManuals } from '@/lib/api/manuals'
import { getErrorMessage } from '@/lib/api/client'

interface ManualState {
  manuals: Manual[]
  loading: boolean
  error: string | null
  fetchManuals: () => Promise<void>
  fetchManual: (manualId: number) => Promise<Manual | null>
}

const upsertManual = (manuals: Manual[], next: Manual) => {
  const index = manuals.findIndex((manual) => manual.id === next.id)
  if (index === -1) {
    return [next, ...manuals]
  }
  const updated = [...manuals]
  updated[index] = next
  return updated
}

export const useManualStore = create<ManualState>((set) => ({
  manuals: [],
  loading: false,
  error: null,
  fetchManuals: async () => {
    set({ loading: true, error: null })
    try {
      const data = await fetchManuals()
      set({ manuals: data, loading: false })
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error) })
    }
  },
  fetchManual: async (manualId) => {
    try {
      const manual = await fetchManual(manualId)
      set((state) => ({ manuals: upsertManual(state.manuals, manual) }))
      return manual
    } catch (error) {
      set({ error: getErrorMessage(error) })
      return null
    }
  },
}))
