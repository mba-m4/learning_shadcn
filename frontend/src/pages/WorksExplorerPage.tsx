import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { CalendarDays, CheckCircle, Clock, Search, X } from 'lucide-react'
import { toast } from 'sonner'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import PageHeader from '@/components/layout/PageHeader'
import { getErrorMessage } from '@/lib/api/client'
import {
  createWorkDateSummaryQueryOptions,
  createWorkGroupsQueryOptions,
  createWorkListQueryOptions,
} from '@/lib/api/queries/works'
import { fetchWorkDateSummary } from '@/lib/api/works'
import { useWorkExplorerStore } from '@/stores/workExplorerStore'

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

export default function WorksExplorerPage() {
  const {
    listStartDate,
    listEndDate,
    listLimit,
    listOffset,
    setListRange,
    setListPaging,
  } = useWorkExplorerStore()

  const [month, setMonth] = useState<Date>(parseDate(listStartDate))
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [showCalendar, setShowCalendar] = useState(false)
  const [groupFilter, setGroupFilter] = useState('all')
  const [titleFilter, setTitleFilter] = useState('')

  const groupsQuery = useQuery(createWorkGroupsQueryOptions())
  const workListQuery = useQuery(
    createWorkListQueryOptions({
      start_date: listStartDate,
      end_date: listEndDate,
      limit: listLimit,
      offset: listOffset,
    }),
  )

  const monthRange = useMemo(() => getMonthRange(month), [month])

  const dateSummaryQuery = useQuery(
    createWorkDateSummaryQueryOptions({
      start_date: formatDate(monthRange.start),
      end_date: formatDate(monthRange.end),
    }),
  )

  const groups = groupsQuery.data ?? []
  const workList = workListQuery.data?.items ?? []
  const workListTotal = workListQuery.data?.total ?? 0
  const dateSummary = dateSummaryQuery.data ?? []
  const loadingList = workListQuery.isLoading || workListQuery.isFetching
  const loadingDateSummary = dateSummaryQuery.isLoading || dateSummaryQuery.isFetching
  const error = workListQuery.error ?? groupsQuery.error ?? dateSummaryQuery.error
  const errorMessage = error ? getErrorMessage(error) : null

  useEffect(() => {
    if (listStartDate === listEndDate) {
      const nextDate = parseDate(listStartDate)
      setSelectedDate(nextDate)
      setMonth(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1))
      return
    }

    setSelectedDate(undefined)
    const rangeStart = parseDate(listStartDate)
    setMonth(new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1))
  }, [listStartDate, listEndDate])

  const groupMap = useMemo(
    () => new Map(groups.map((group) => [group.id, group.name])),
    [groups],
  )

  const summaryMap = useMemo(
    () => new Map(dateSummary.map((entry) => [entry.work_date, entry.count])),
    [dateSummary],
  )

  const statusLabel = {
    draft: '下書き',
    confirmed: '確定',
  }

  const statusTone = {
    draft: 'text-amber-700 bg-amber-50',
    confirmed: 'text-emerald-700 bg-emerald-50',
  }

  const statusIcon = (status: keyof typeof statusLabel) => {
    if (status === 'confirmed') {
      return <CheckCircle className="h-5 w-5 text-emerald-600" />
    }
    return <Clock className="h-5 w-5 text-amber-600" />
  }

  const filteredWorkList = useMemo(() => {
    const groupId = groupFilter === 'all' ? null : Number(groupFilter)
    const titleKeyword = titleFilter.trim().toLowerCase()

    return workList.filter((entry) => {
      const matchesGroup = groupId ? entry.work.group_id === groupId : true
      const matchesTitle = titleKeyword
        ? entry.work.title.toLowerCase().includes(titleKeyword) ||
          entry.work.description.toLowerCase().includes(titleKeyword)
        : true
      return matchesGroup && matchesTitle
    })
  }, [groupFilter, titleFilter, workList])

  const riskStats = useMemo(() => {
    const totalRisks = filteredWorkList.reduce(
      (sum, work) => sum + work.risk_count,
      0,
    )
    const totalWorks = filteredWorkList.length
    return {
      totalRisks,
      totalWorks,
      avgRisksPerWork:
        totalWorks > 0 ? (totalRisks / totalWorks).toFixed(1) : '0',
    }
  }, [filteredWorkList])

  const handleMonthChange = (nextMonth: Date) => {
    setMonth(nextMonth)
    const range = getMonthRange(nextMonth)
    setSelectedDate(undefined)
    setListRange(formatDate(range.start), formatDate(range.end))
  }

  const handleDaySelect = (date?: Date) => {
    if (!date) {
      return
    }
    setSelectedDate(date)
    setListRange(formatDate(date), formatDate(date))
  }

  const handleResetRange = () => {
    const range = getMonthRange(month)
    setSelectedDate(undefined)
    setListRange(formatDate(range.start), formatDate(range.end))
  }

  const totalPages = Math.ceil(workListTotal / listLimit)
  const currentPage = Math.floor(listOffset / listLimit) + 1
  const rangeStart = workListTotal === 0 ? 0 : listOffset + 1
  const rangeEnd = Math.min(listOffset + listLimit, workListTotal)
  const isSingleDay = listStartDate === listEndDate
  const rangeLabel = isSingleDay
    ? `${format(parseDate(listStartDate), 'yyyy年M月d日')}分表示`
    : `${format(parseDate(listStartDate), 'yyyy年M月')}分表示`
  const isFilterActive = groupFilter !== 'all' || titleFilter.trim().length > 0

  const jumpToWorkMonth = async (direction: 'next' | 'prev') => {
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
      const summary = await fetchWorkDateSummary({
        start_date: formatDate(searchStart),
        end_date: formatDate(searchEnd),
      })

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

        const nextDateSummary = await fetchWorkDateSummary({
          start_date: formatDate(dateSearchStart),
          end_date: formatDate(dateSearchEnd),
        })

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

        const nextDate = parseDate(targetDateKey)
        setMonth(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1))
        setSelectedDate(nextDate)
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
      setMonth(nextMonth)
      setSelectedDate(undefined)
      setListRange(formatDate(range.start), formatDate(range.end))
    } catch {
      toast.error('作業月の取得に失敗しました。')
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="全件ビュー"
        subtitle="月単位の一覧と表形式を併用して確認します。"
      />
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-xl border border-border/60 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-6 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                Explorer
              </p>
              <p className="mt-2 text-base font-semibold text-slate-900">作業一覧</p>
              <p className="text-xs text-muted-foreground">
                {workListTotal} 件中 {rangeStart} - {rangeEnd} 件
              </p>
              <p className="text-xs text-muted-foreground">{rangeLabel}</p>
              {isFilterActive && (
                <p className="text-xs text-muted-foreground">
                  フィルター後: {filteredWorkList.length} 件
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
                <Input
                  type="date"
                  value={listStartDate}
                  onChange={(event) =>
                    isValidDateInput(event.target.value)
                      ? setListRange(event.target.value, listEndDate)
                      : null
                  }
                  className="h-9 w-full md:w-[180px]"
                />
                <span className="hidden text-xs text-muted-foreground md:inline">〜</span>
                <Input
                  type="date"
                  value={listEndDate}
                  onChange={(event) =>
                    isValidDateInput(event.target.value)
                      ? setListRange(listStartDate, event.target.value)
                      : null
                  }
                  className="h-9 w-full md:w-[180px]"
                />
              </div>
              <Input
                type="number"
                min={10}
                max={100}
                value={listLimit}
                onChange={(event) => {
                  const nextLimit = Number(event.target.value)
                  if (!Number.isFinite(nextLimit) || nextLimit <= 0) {
                    return
                  }
                  setListPaging(nextLimit, 0)
                }}
                className="w-[90px]"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  void workListQuery.refetch()
                }}
              >
                再読み込み
              </Button>
            </div>
          </div>
          <div className="px-6 py-4">
            <Accordion type="single" collapsible>
              <AccordionItem value="filters" className="border-none">
                <AccordionTrigger className="py-2 text-xs text-muted-foreground">
                  詳細検索を開く
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>グループ</Label>
                      <Select value={groupFilter} onValueChange={setGroupFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="全て" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全て</SelectItem>
                          {groups.map((group) => (
                            <SelectItem key={group.id} value={String(group.id)}>
                              {group.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>作業名検索</Label>
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={titleFilter}
                          onChange={(event) => setTitleFilter(event.target.value)}
                          placeholder="作業タイトル/説明を検索"
                          className="pl-9"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-[11px] text-muted-foreground">
                      詳細検索は取得済みデータに対して適用されます。
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setGroupFilter('all')
                        setTitleFilter('')
                      }}
                    >
                      クリア
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {isFilterActive && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {groupFilter !== 'all' && (
                  <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1">
                    <span className="text-xs font-medium text-blue-900">
                      グループ: {groupMap.get(Number(groupFilter))}
                    </span>
                    <button
                      type="button"
                      onClick={() => setGroupFilter('all')}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {titleFilter.trim().length > 0 && (
                  <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1">
                    <span className="text-xs font-medium text-purple-900">
                      検索: {titleFilter}
                    </span>
                    <button
                      type="button"
                      onClick={() => setTitleFilter('')}
                      className="text-purple-600 hover:text-purple-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {isFilterActive && filteredWorkList.length > 0 && (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    総リスク数
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {riskStats.totalRisks}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {riskStats.totalWorks}件の作業
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    作業1件あたり
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {riskStats.avgRisksPerWork}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">平均リスク数</p>
                </div>
              </div>
            )}

            {errorMessage && (
              <p className="mt-4 text-sm text-destructive">{errorMessage}</p>
            )}

            <div className="mt-4">
              {loadingList ? (
                <p className="text-sm text-muted-foreground">読み込み中...</p>
              ) : workList.length === 0 ? (
                <p className="text-sm text-muted-foreground">データがありません。</p>
              ) : filteredWorkList.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  条件に一致する作業がありません。
                </p>
              ) : (
                <div className="space-y-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">状態</TableHead>
                        <TableHead>タイトル</TableHead>
                        <TableHead className="w-24">グループ</TableHead>
                        <TableHead className="w-20 text-center">項目</TableHead>
                        <TableHead className="w-20 text-center">リスク</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWorkList.map((entry) => (
                        <TableRow key={entry.work.id} className="cursor-pointer">
                          <TableCell>
                            <Link
                              to={`/works/${entry.work.id}`}
                              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold transition-colors hover:underline"
                            >
                              {statusIcon(entry.work.status)}
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusTone[entry.work.status]}`}
                              >
                                {statusLabel[entry.work.status]}
                              </span>
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Link
                              to={`/works/${entry.work.id}`}
                              className="group block hover:underline"
                            >
                              <p className="font-semibold text-slate-900">
                                {entry.work.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {entry.work.description}
                              </p>
                            </Link>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {groupMap.get(entry.work.group_id) ?? `#${entry.work.group_id}`}
                          </TableCell>
                          <TableCell className="text-center text-sm text-muted-foreground">
                            {entry.items.length}
                          </TableCell>
                          <TableCell className="text-center text-sm text-muted-foreground">
                            {entry.risk_count}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex items-center justify-between text-sm">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setListPaging(listLimit, Math.max(0, listOffset - listLimit))
                      }
                      disabled={listOffset === 0}
                    >
                      前へ
                    </Button>
                    <span className="text-muted-foreground">
                      {currentPage} / {Math.max(totalPages, 1)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setListPaging(listLimit, listOffset + listLimit)}
                      disabled={listOffset + listLimit >= workListTotal}
                    >
                      次へ
                    </Button>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <Button variant="outline" size="sm" onClick={() => jumpToWorkMonth('prev')}>
                      {isSingleDay ? '前の作業日へ' : '前の作業月へ'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => jumpToWorkMonth('next')}>
                      {isSingleDay ? '次の作業日へ' : '次の作業月へ'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="hidden lg:block">
          <div className="self-start rounded-xl border border-border/60 bg-white px-5 py-4 lg:sticky lg:top-28">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                Calendar
              </p>
              <span className="text-xs text-muted-foreground">
                {loadingDateSummary ? '更新中' : '作業あり日を表示'}
              </span>
            </div>
            <p className="mt-2 text-base font-semibold text-slate-900">作業日カレンダー</p>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDaySelect}
              month={month}
              onMonthChange={handleMonthChange}
              className="mt-3 w-full rounded-xl border border-border/60 bg-white p-2"
              modifiers={{
                hasWork: (date) => summaryMap.has(formatDate(date)),
              }}
              modifiersClassNames={{
                hasWork: 'bg-amber-100 text-amber-900 font-semibold',
              }}
            />
            <div className="mt-3 flex items-center justify-between gap-2">
              <Button size="sm" variant="outline" onClick={handleResetRange}>
                月表示に戻す
              </Button>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex h-3 w-3 rounded-sm bg-amber-100" />
              作業がある日
            </div>
          </div>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        className="fixed bottom-6 right-6 z-30 h-12 w-12 rounded-full p-0 lg:hidden"
        onClick={() => setShowCalendar(true)}
      >
        <CalendarDays className="h-5 w-5" />
      </Button>
      {showCalendar && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/20 lg:hidden"
          onClick={() => setShowCalendar(false)}
        >
          <div
            className="absolute bottom-20 right-6 w-[320px] max-w-[calc(100vw-48px)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="rounded-xl border border-border/60 bg-white px-5 py-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                  Calendar
                </p>
                <Button size="sm" variant="ghost" onClick={() => setShowCalendar(false)}>
                  閉じる
                </Button>
              </div>
              <p className="mt-2 text-base font-semibold text-slate-900">作業日カレンダー</p>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  handleDaySelect(date)
                  setShowCalendar(false)
                }}
                month={month}
                onMonthChange={handleMonthChange}
                className="mt-3 w-full rounded-xl border border-border/60 bg-white p-2"
                modifiers={{
                  hasWork: (date) => summaryMap.has(formatDate(date)),
                }}
                modifiersClassNames={{
                  hasWork: 'bg-amber-100 text-amber-900 font-semibold',
                }}
              />
              <div className="mt-3 flex items-center justify-between gap-2">
                <Button size="sm" variant="outline" onClick={handleResetRange}>
                  月表示に戻す
                </Button>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex h-3 w-3 rounded-sm bg-amber-100" />
                作業がある日
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}