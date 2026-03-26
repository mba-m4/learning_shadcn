import { create } from 'zustand'
import type { WorkStatus } from '@/types/api'

export interface WorkItemDraft {
  name: string
  description: string
}

export interface WorkDraft {
  title: string
  description: string
  group_id: number | null
  work_date: string
  status: WorkStatus
}

interface WorkEditorState {
  draftWork: WorkDraft
  workItemsDraft: WorkItemDraft[]
  setDraftField: (key: keyof WorkDraft, value: string | number | null) => void
  addItemDraft: (item: WorkItemDraft) => void
  updateItemDraft: (index: number, item: WorkItemDraft) => void
  removeItemDraft: (index: number) => void
  resetDraft: () => void
}

const getToday = () => new Date().toISOString().slice(0, 10)

const createDefaultDraft = (): WorkDraft => ({
  title: '',
  description: '',
  group_id: null,
  work_date: getToday(),
  status: 'draft',
})

export const useWorkEditorStore = create<WorkEditorState>((set) => ({
  draftWork: createDefaultDraft(),
  workItemsDraft: [],
  setDraftField: (key, value) =>
    set((state) => ({
      draftWork: {
        ...state.draftWork,
        [key]: value,
      },
    })),
  addItemDraft: (item) =>
    set((state) => ({
      workItemsDraft: [...state.workItemsDraft, item],
    })),
  updateItemDraft: (index, item) =>
    set((state) => {
      const next = [...state.workItemsDraft]
      next[index] = item
      return { workItemsDraft: next }
    }),
  removeItemDraft: (index) =>
    set((state) => ({
      workItemsDraft: state.workItemsDraft.filter((_, i) => i !== index),
    })),
  resetDraft: () => set({ draftWork: createDefaultDraft(), workItemsDraft: [] }),
}))
