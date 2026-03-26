import { useCallback, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/api/client'
import {
  createWorkDateSummaryQueryOptions,
  createWorkGroupsQueryOptions,
  createWorkListQueryOptions,
} from '@/features/works/api/queries'
import { useWorkExplorerStore } from '@/stores/workExplorerStore'
import type { WorkDateSummary, WorkGroup, WorkListItem, WorkListResponse } from '@/types/api'

const formatDate = (date: Date) => format(date, 'yyyy-MM-dd')

const getMonthRange = (date: Date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  return { start, end }
}

const getMonthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

const parseDate = (value: string) => new Date(`${value}T00:00:00`)
const isValidDateInput = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value)

type JumpDirection = 'next' | 'prev'

interface ExplorerGroupsView {
  groupMap: Map<number, string>
  groups: WorkGroup[]
}

interface ExplorerListView {
  filteredWorkList: WorkListItem[]
  riskStats: {
    avgRisksPerWork: string
    totalRisks: number
    totalWorks: number
  }
  sourceCount: number
  total: number
}

const selectGroupsView = (groups: WorkGroup[]): ExplorerGroupsView => ({
  groups,
  groupMap: new Map(groups.map((group) => [group.id, group.name])),
})

const selectHasWorkDates = (entries: WorkDateSummary[]) =>
  new Set(entries.map((entry) => entry.work_date))

export function useWorksExplorerController() {
  const queryClient = useQueryClient()
  const {
    listStartDate,
    listEndDate,
    listLimit,
    listOffset,
    setListRange,
    setListPaging,
  } = useWorkExplorerStore()
  const [showCalendar, setShowCalendar] = useState(false)
  const [groupFilter, setGroupFilter] = useState('all')
  const [titleFilter, setTitleFilter] = useState('')

  const selectWorkListView = useCallback(
    (response: WorkListResponse): ExplorerListView => {
      const groupId = groupFilter === 'all' ? null : Number(groupFilter)
      const titleKeyword = titleFilter.trim().toLowerCase()
      const filteredWorkList = response.items.filter((entry) => {
        const matchesGroup = groupId ? entry.work.group_id === groupId : true
        const matchesTitle = titleKeyword
          ? entry.work.title.toLowerCase().includes(titleKeyword) ||
            entry.work.description.toLowerCase().includes(titleKeyword)
          : true
        return matchesGroup && matchesTitle
      })
      const totalRisks = filteredWorkList.reduce(
        (sum, work) => sum + work.risk_count,
        0,
      )
      const totalWorks = filteredWorkList.length

      return {
        filteredWorkList,
        riskStats: {
          totalRisks,
          totalWorks,
          avgRisksPerWork:
            totalWorks > 0 ? (totalRisks / totalWorks).toFixed(1) : '0',
        },
        sourceCount: response.items.length,
        total: response.total,
      }
    },
    [groupFilter, titleFilter],
  )

  const groupsQuery = useQuery(
    createWorkGroupsQueryOptions({
      select: selectGroupsView,
    }),
  )
  const workListQuery = useQuery(
    createWorkListQueryOptions({
      start_date: listStartDate,
      end_date: listEndDate,
      limit: listLimit,
      offset: listOffset,
    }, {
      select: selectWorkListView,
    }),
  )

  const isSingleDay = listStartDate === listEndDate
  const selectedDate = isSingleDay ? parseDate(listStartDate) : undefined
  const monthSourceDate = parseDate(listStartDate)
  const month = new Date(monthSourceDate.getFullYear(), monthSourceDate.getMonth(), 1)
  const monthRange = getMonthRange(month)

  const dateSummaryQuery = useQuery(
    createWorkDateSummaryQueryOptions(
      {
        start_date: formatDate(monthRange.start),
        end_date: formatDate(monthRange.end),
      },
      {
        select: selectHasWorkDates,
      },
    ),
  )

  const groups = groupsQuery.data?.groups ?? []
  const groupMap = groupsQuery.data?.groupMap ?? new Map<number, string>()
  const filteredWorkList = workListQuery.data?.filteredWorkList ?? []
  const riskStats = workListQuery.data?.riskStats ?? {
    avgRisksPerWork: '0',
    totalRisks: 0,
    totalWorks: 0,
  }
  const workListTotal = workListQuery.data?.total ?? 0
  const sourceCount = workListQuery.data?.sourceCount ?? 0
  const hasWorkDates = dateSummaryQuery.data ?? new Set<string>()
  const loadingList = workListQuery.isLoading || workListQuery.isFetching
  const loadingDateSummary = dateSummaryQuery.isLoading || dateSummaryQuery.isFetching
  const error = workListQuery.error ?? groupsQuery.error ?? dateSummaryQuery.error
  const errorMessage = error ? getErrorMessage(error) : null

  const totalPages = Math.ceil(workListTotal / listLimit)
  const currentPage = Math.floor(listOffset / listLimit) + 1
  const rangeStart = workListTotal === 0 ? 0 : listOffset + 1
  const rangeEnd = Math.min(listOffset + listLimit, workListTotal)
  const rangeLabel = isSingleDay
    ? `${format(parseDate(listStartDate), 'yyyy年M月d日')}分表示`
    : `${format(parseDate(listStartDate), 'yyyy年M月')}分表示`
  const isFilterActive = groupFilter !== 'all' || titleFilter.trim().length > 0

  const handleMonthChange = (nextMonth: Date) => {
    const range = getMonthRange(nextMonth)
    setListRange(formatDate(range.start), formatDate(range.end))
  }

  const handleDaySelect = (date?: Date) => {
    if (!date) {
      return
    }

    setListRange(formatDate(date), formatDate(date))
  }

  const handleResetRange = () => {
    const range = getMonthRange(month)
    setListRange(formatDate(range.start), formatDate(range.end))
  }

  const updateStartDate = (value: string) => {
    if (!isValidDateInput(value)) {
      return
    }
    setListRange(value, listEndDate)
  }

  const updateEndDate = (value: string) => {
    if (!isValidDateInput(value)) {
      return
    }
    setListRange(listStartDate, value)
  }

  const updateListLimit = (value: string) => {
    const nextLimit = Number(value)
    if (!Number.isFinite(nextLimit) || nextLimit <= 0) {
      return
    }
    setListPaging(nextLimit, 0)
  }

  const clearFilters = () => {
    setGroupFilter('all')
    setTitleFilter('')
  }

  const jumpToWorkMonth = async (direction: JumpDirection) => {
    const currentKey = getMonthKey(month)
    const currentRange = getMonthRange(month)
    const searchStart = new Date(currentRange.start)
    const searchEnd = new Date(currentRange.end)

    if (direction === 'next') {
      searchStart.setMonth(searchStart.getMonth() + 1)
      searchEnd.setMonth(searchEnd.getMonth() + 12)
    } else {
      searchStart.setMonth(searchStart.getMonth() - 12)
      searchEnd.setMonth(searchEnd.getMonth() - 1)
    }

    try {
      const summary = await queryClient.fetchQuery(
        createWorkDateSummaryQueryOptions({
          start_date: formatDate(searchStart),
          end_date: formatDate(searchEnd),
        }),
      )

      if (selectedDate) {
        const currentDateKey = formatDate(selectedDate)
        const dateSearchStart = new Date(selectedDate)
        const dateSearchEnd = new Date(selectedDate)

        if (direction === 'next') {
          dateSearchStart.setDate(dateSearchStart.getDate() + 1)
          dateSearchEnd.setMonth(dateSearchEnd.getMonth() + 12)
        } else {
          dateSearchStart.setMonth(dateSearchStart.getMonth() - 12)
          dateSearchEnd.setDate(dateSearchEnd.getDate() - 1)
        }

        const nextDateSummary = await queryClient.fetchQuery(
          createWorkDateSummaryQueryOptions({
            start_date: formatDate(dateSearchStart),
            end_date: formatDate(dateSearchEnd),
          }),
        )

        const dateKeys = Array.from(
          new Set(nextDateSummary.map((entry) => entry.work_date)),
        ).sort()
        const targetDateKey =
          direction === 'next'
            ? dateKeys.find((key) => key > currentDateKey)
            : dateKeys.reverse().find((key) => key < currentDateKey)

        if (!targetDateKey) {
          toast.info('対象となる作業日がありません。')
          return
        }

        setListRange(targetDateKey, targetDateKey)
        return
      }

      const monthKeys = Array.from(
        new Set(summary.map((entry) => getMonthKey(parseDate(entry.work_date)))),
      ).sort()
      const targetKey =
        direction === 'next'
          ? monthKeys.find((key) => key > currentKey)
          : monthKeys.reverse().find((key) => key < currentKey)

      if (!targetKey) {
        toast.info('対象となる作業月がありません。')
        return
      }

      const [year, monthValue] = targetKey.split('-').map(Number)
      const nextMonth = new Date(year, monthValue - 1, 1)
      const range = getMonthRange(nextMonth)
      setListRange(formatDate(range.start), formatDate(range.end))
    } catch {
      toast.error('作業月の取得に失敗しました。')
    }
  }

  return {
    currentPage,
    errorMessage,
    filteredWorkList,
    groupFilter,
    groupMap,
    groups,
    handleDaySelect,
    handleMonthChange,
    handleResetRange,
    hasWorkDates,
    isFilterActive,
    isSingleDay,
    listEndDate,
    listLimit,
    listOffset,
    listStartDate,
    loadingDateSummary,
    loadingList,
    month,
    rangeEnd,
    rangeLabel,
    rangeStart,
    riskStats,
    selectedDate,
    setGroupFilter,
    setShowCalendar,
    setTitleFilter,
    showCalendar,
    titleFilter,
    totalPages,
    updateEndDate,
    updateListLimit,
    updateStartDate,
    workList: filteredWorkList,
    sourceCount,
    workListTotal,
    clearFilters,
    jumpToWorkMonth,
    refetchWorkList: workListQuery.refetch,
    goToPreviousPage: () => setListPaging(listLimit, Math.max(0, listOffset - listLimit)),
    goToNextPage: () => setListPaging(listLimit, listOffset + listLimit),
  }
}