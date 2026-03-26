import { format } from 'date-fns'
import { create } from 'zustand'
import type { WorkDateSummary, WorkGroup, WorkListItem, WorkOverview } from '@/types/api'
import {
  fetchDailyOverview,
  fetchGroups,
  fetchWorkDateSummary,
  fetchWorkList,
} from '@/lib/api/works'
import { getErrorMessage } from '@/lib/api/client'

interface WorkState {
  date: string
  dailyOverview: WorkOverview[]
  groups: WorkGroup[]
  workList: WorkListItem[]
  workListTotal: number
  listStartDate: string
  listEndDate: string
  listLimit: number
  listOffset: number
  dateSummary: WorkDateSummary[]
  loadingDaily: boolean
  loadingGroups: boolean
  loadingList: boolean
  loadingDateSummary: boolean
  error: string | null
  setDate: (date: string) => void
  setListRange: (startDate: string, endDate: string) => void
  setListPaging: (limit: number, offset: number) => void
  fetchDailyOverview: (date: string) => Promise<void>
  fetchGroups: () => Promise<void>
  fetchWorkList: () => Promise<void>
  fetchDateSummary: (startDate?: string, endDate?: string) => Promise<void>
}

const formatDate = (date: Date) => format(date, 'yyyy-MM-dd')
const isValidDateString = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value)

const getToday = () => formatDate(new Date())

const getMonthRange = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return {
    start: formatDate(start),
    end: formatDate(end),
  }
}

const defaultRange = getMonthRange()

export const useWorkStore = create<WorkState>((set, get) => ({
  date: getToday(),
  dailyOverview: [],
  groups: [],
  workList: [],
  workListTotal: 0,
  listStartDate: defaultRange.start,
  listEndDate: defaultRange.end,
  listLimit: 20,
  listOffset: 0,
  dateSummary: [],
  loadingDaily: false,
  loadingGroups: false,
  loadingList: false,
  loadingDateSummary: false,
  error: null,
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
        listLimit: data.limit,
        listOffset: data.offset,
        loadingList: false,
      })
    } catch (error) {
      set({ loadingList: false, error: getErrorMessage(error) })
    }
  },
  fetchDateSummary: async (startDate, endDate) => {
    set({ loadingDateSummary: true, error: null })
    try {
      const { listStartDate, listEndDate } = get()
      const rangeStart = startDate ?? listStartDate
      const rangeEnd = endDate ?? listEndDate
      if (!isValidDateString(rangeStart) || !isValidDateString(rangeEnd)) {
        set({
          loadingDateSummary: false,
          error: '日付形式が不正です。YYYY-MM-DD で入力してください。',
        })
        return
      }
      const data = await fetchWorkDateSummary({
        start_date: rangeStart,
        end_date: rangeEnd,
      })
      set({ dateSummary: data, loadingDateSummary: false })
    } catch (error) {
      set({ loadingDateSummary: false, error: getErrorMessage(error) })
    }
  },
}))
