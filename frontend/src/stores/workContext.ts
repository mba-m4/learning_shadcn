import { format, startOfMonth, endOfMonth } from 'date-fns'
import { create } from 'zustand'
import type {
  WorkOverview,
  WorkGroup,
  WorkListItem,
  WorkDateSummary,
  ManualRisk,
  RiskAssessment,
  WorkComment,
  RiskSummary,
} from '@/types/api'
import {
  fetchDailyOverview,
  fetchGroups,
  fetchWorkDateSummary,
  fetchWorkList,
  fetchWorkDetail,
  createWork,
  generateRisk,
} from '@/features/works/api/service'
import {
  fetchManualRisks,
  createManualRisk,
  fetchRiskSummary,
} from '@/features/works/api/service'
import {
  fetchComments,
  addComment as apiAddComment,
} from '@/features/works/api/service'
import { getErrorMessage } from '@/shared/api/client'

interface WorkDraft {
  title: string
  description: string
  group_id: number | null
  work_date: string
  status: 'draft' | 'confirmed'
  items: Array<{ name: string; description: string }>
}

interface WorkContextState {
  // ===== データ =====
  date: string
  dailyOverview: WorkOverview[]
  workDetail: WorkOverview | null
  groups: WorkGroup[]
  workList: WorkListItem[]
  workListTotal: number
  dateSummary: WorkDateSummary[]

  // リスク（統合）
  manualRisksByItemId: Record<number, ManualRisk[]>
  riskSummaryByWorkId: Record<number, RiskSummary | null>

  // コメント（統合）
  commentsByWorkId: Record<number, WorkComment[]>

  // ドラフト
  draft: WorkDraft | null

  // ===== UI State =====
  listStartDate: string
  listEndDate: string
  listLimit: number
  listOffset: number

  // ===== ローディング・エラー =====
  loadingDaily: boolean
  loadingGroups: boolean
  loadingList: boolean
  loadingDateSummary: boolean
  loadingDetail: Record<number, boolean>
  loadingRisks: Record<number, boolean>
  loadingComments: Record<number, boolean>
  loadingSummary: Record<number, boolean>
  error: string | null

  // ===== アクション: 作業 =====
  setDate: (date: string) => void
  setListRange: (startDate: string, endDate: string) => void
  setListPaging: (limit: number, offset: number) => void
  fetchDailyOverview: (date: string) => Promise<void>
  fetchGroups: () => Promise<void>
  fetchWorkList: () => Promise<void>
  fetchWorkDetail: (workId: number) => Promise<void>
  fetchDateSummary: (startDate?: string, endDate?: string) => Promise<void>
  createWork: (payload: {
    title: string
    description: string
    group_id: number
    work_date: string
    status: string
  }) => Promise<any>

  // ===== アクション: ドラフト =====
  initializeDraft: () => void
  setDraftField: <K extends keyof WorkDraft>(
    key: K,
    value: WorkDraft[K]
  ) => void
  addDraftItem: (name: string, description: string) => void
  removeDraftItem: (index: number) => void
  resetDraft: () => void

  // ===== アクション: リスク（統合） =====
  fetchManualRisks: (itemId: number) => Promise<void>
  addManualRisk: (itemId: number, content: string) => Promise<ManualRisk | null>
  generateRisk: (itemId: number) => Promise<RiskAssessment | null>
  fetchRiskSummary: (workId: number) => Promise<void>

  // ===== アクション: コメント（統合） =====
  fetchComments: (workId: number) => Promise<void>
  addComment: (workId: number, content: string) => Promise<WorkComment | null>
}

const formatDate = (date: Date) => format(date, 'yyyy-MM-dd')
const getToday = () => formatDate(new Date())
const getMonthRange = () => {
  const now = new Date()
  const start = startOfMonth(now)
  const end = endOfMonth(now)
  return {
    start: formatDate(start),
    end: formatDate(end),
  }
}

const defaultRange = getMonthRange()

export const useWorkContext = create<WorkContextState>((set, get) => ({
  // ===== 初期状態 =====
  date: getToday(),
  dailyOverview: [],
  workDetail: null,
  groups: [],
  workList: [],
  workListTotal: 0,
  dateSummary: [],
  manualRisksByItemId: {},
  riskSummaryByWorkId: {},
  commentsByWorkId: {},
  draft: null,
  listStartDate: defaultRange.start,
  listEndDate: defaultRange.end,
  listLimit: 20,
  listOffset: 0,
  loadingDaily: false,
  loadingGroups: false,
  loadingList: false,
  loadingDateSummary: false,
  loadingDetail: {},
  loadingRisks: {},
  loadingComments: {},
  loadingSummary: {},
  error: null,

  // ===== 作業アクション =====
  setDate: (date) => set({ date }),
  setListRange: (startDate, endDate) =>
    set({ listStartDate: startDate, listEndDate: endDate, listOffset: 0 }),
  setListPaging: (limit, offset) => set({ listLimit: limit, listOffset: offset }),

  fetchDailyOverview: async (date) => {
    set({ loadingDaily: true, error: null })
    try {
      const data = await fetchDailyOverview(date)
      set({ dailyOverview: data, loadingDaily: false })
    } catch (error) {
      set({ loadingDaily: false, error: getErrorMessage(error) })
    }
  },

  fetchGroups: async () => {
    set({ loadingGroups: true, error: null })
    try {
      const data = await fetchGroups()
      set({ groups: data, loadingGroups: false })
    } catch (error) {
      set({ loadingGroups: false, error: getErrorMessage(error) })
    }
  },

  fetchWorkList: async () => {
    set({ loadingList: true, error: null })
    try {
      const { listStartDate, listEndDate, listLimit, listOffset } = get()
      const data = await fetchWorkList({
        start_date: listStartDate,
        end_date: listEndDate,
        limit: listLimit,
        offset: listOffset,
      })
      set({
        workList: data.items,
        workListTotal: data.total,
        loadingList: false,
      })
    } catch (error) {
      set({ loadingList: false, error: getErrorMessage(error) })
    }
  },

  fetchWorkDetail: async (workId) => {
    set((state) => ({
      loadingDetail: { ...state.loadingDetail, [workId]: true },
      error: null,
    }))
    try {
      const data = await fetchWorkDetail(workId)
      set((state) => ({
        workDetail: data,
        loadingDetail: { ...state.loadingDetail, [workId]: false },
      }))
    } catch (error) {
      set((state) => ({
        loadingDetail: { ...state.loadingDetail, [workId]: false },
        error: getErrorMessage(error),
      }))
    }
  },

  fetchDateSummary: async (startDate, endDate) => {
    set({ loadingDateSummary: true, error: null })
    try {
      const { listStartDate, listEndDate } = get()
      const start = startDate ?? listStartDate
      const end = endDate ?? listEndDate
      const data = await fetchWorkDateSummary({ start_date: start, end_date: end })
      set({ dateSummary: data, loadingDateSummary: false })
    } catch (error) {
      set({ loadingDateSummary: false, error: getErrorMessage(error) })
    }
  },

  createWork: async (payload) => {
    try {
      const data = await createWork({
        title: payload.title,
        description: payload.description,
        group_id: payload.group_id,
        work_date: payload.work_date,
        status: (payload.status as 'draft' | 'confirmed') || 'draft',
      })
      return data
    } catch (error) {
      set({ error: getErrorMessage(error) })
      return null
    }
  },

  // ===== ドラフトアクション =====
  initializeDraft: () => {
    set({
      draft: {
        title: '',
        description: '',
        group_id: null,
        work_date: getToday(),
        status: 'draft',
        items: [],
      },
    })
  },

  setDraftField: (key, value) => {
    set((state) => ({
      draft: state.draft ? { ...state.draft, [key]: value } : null,
    }))
  },

  addDraftItem: (name, description) => {
    set((state) => ({
      draft: state.draft
        ? {
            ...state.draft,
            items: [...state.draft.items, { name, description }],
          }
        : null,
    }))
  },

  removeDraftItem: (index) => {
    set((state) => ({
      draft: state.draft
        ? {
            ...state.draft,
            items: state.draft.items.filter((_, i) => i !== index),
          }
        : null,
    }))
  },

  resetDraft: () => set({ draft: null }),

  // ===== リスクアクション =====
  fetchManualRisks: async (itemId) => {
    set((state) => ({
      loadingRisks: { ...state.loadingRisks, [itemId]: true },
    }))
    try {
      const data = await fetchManualRisks(itemId)
      set((state) => ({
        manualRisksByItemId: { ...state.manualRisksByItemId, [itemId]: data },
        loadingRisks: { ...state.loadingRisks, [itemId]: false },
      }))
    } catch (error) {
      set((state) => ({
        loadingRisks: { ...state.loadingRisks, [itemId]: false },
        error: getErrorMessage(error),
      }))
    }
  },

  addManualRisk: async (itemId, content) => {
    try {
      const data = await createManualRisk(itemId, content)
      set((state) => ({
        manualRisksByItemId: {
          ...state.manualRisksByItemId,
          [itemId]: [data, ...(state.manualRisksByItemId[itemId] ?? [])],
        },
      }))
      return data
    } catch (error) {
      set({ error: getErrorMessage(error) })
      return null
    }
  },

  generateRisk: async (itemId) => {
    try {
      const data = await generateRisk(itemId)
      return data
    } catch (error) {
      set({ error: getErrorMessage(error) })
      return null
    }
  },

  fetchRiskSummary: async (workId) => {
    set((state) => ({
      loadingSummary: { ...state.loadingSummary, [workId]: true },
    }))
    try {
      const data = await fetchRiskSummary(workId)
      set((state) => ({
        riskSummaryByWorkId: { ...state.riskSummaryByWorkId, [workId]: data },
        loadingSummary: { ...state.loadingSummary, [workId]: false },
      }))
    } catch (error) {
      set((state) => ({
        loadingSummary: { ...state.loadingSummary, [workId]: false },
        error: getErrorMessage(error),
      }))
    }
  },

  // ===== コメントアクション =====
  fetchComments: async (workId) => {
    set((state) => ({
      loadingComments: { ...state.loadingComments, [workId]: true },
    }))
    try {
      const data = await fetchComments(workId)
      set((state) => ({
        commentsByWorkId: { ...state.commentsByWorkId, [workId]: data },
        loadingComments: { ...state.loadingComments, [workId]: false },
      }))
    } catch (error) {
      set((state) => ({
        loadingComments: { ...state.loadingComments, [workId]: false },
        error: getErrorMessage(error),
      }))
    }
  },

  addComment: async (workId, content) => {
    try {
      const data = await apiAddComment(workId, content)
      set((state) => ({
        commentsByWorkId: {
          ...state.commentsByWorkId,
          [workId]: [data, ...(state.commentsByWorkId[workId] ?? [])],
        },
      }))
      return data
    } catch (error) {
      set({ error: getErrorMessage(error) })
      return null
    }
  },
}))
