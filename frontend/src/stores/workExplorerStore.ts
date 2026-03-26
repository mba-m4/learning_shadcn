import { format } from 'date-fns'
import { create } from 'zustand'

interface WorkExplorerState {
  listStartDate: string
  listEndDate: string
  listLimit: number
  listOffset: number
  setListRange: (startDate: string, endDate: string) => void
  setListPaging: (limit: number, offset: number) => void
}

const formatDate = (date: Date) => format(date, 'yyyy-MM-dd')

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

export const useWorkExplorerStore = create<WorkExplorerState>((set) => ({
  listStartDate: defaultRange.start,
  listEndDate: defaultRange.end,
  listLimit: 20,
  listOffset: 0,
  setListRange: (startDate, endDate) =>
    set({
      listStartDate: startDate,
      listEndDate: endDate,
      listOffset: 0,
    }),
  setListPaging: (limit, offset) => set({ listLimit: limit, listOffset: offset }),
}))