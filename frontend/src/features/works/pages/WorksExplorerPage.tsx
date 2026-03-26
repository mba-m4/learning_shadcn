import { CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/layout/PageHeader'
import { useWorksExplorerController } from '@/features/works/model/useWorksExplorerController'
import WorksExplorerCalendarPanel from '@/features/works/ui/WorksExplorerCalendarPanel'
import WorksExplorerFilters from '@/features/works/ui/WorksExplorerFilters'
import WorksExplorerTable from '@/features/works/ui/WorksExplorerTable'
import WorksExplorerToolbar from '@/features/works/ui/WorksExplorerToolbar'

export default function WorksExplorerPage() {
  const explorer = useWorksExplorerController()

  return (
    <div className="space-y-8">
      <PageHeader
        title="全件ビュー"
        subtitle="月単位の一覧と表形式を併用して確認します。"
      />
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-xl border border-border/60 bg-white">
          <WorksExplorerToolbar
            filteredCount={explorer.filteredWorkList.length}
            isFilterActive={explorer.isFilterActive}
            listEndDate={explorer.listEndDate}
            listLimit={explorer.listLimit}
            listStartDate={explorer.listStartDate}
            onEndDateChange={explorer.updateEndDate}
            onLimitChange={explorer.updateListLimit}
            onRefetch={() => {
              void explorer.refetchWorkList()
            }}
            onStartDateChange={explorer.updateStartDate}
            rangeEnd={explorer.rangeEnd}
            rangeLabel={explorer.rangeLabel}
            rangeStart={explorer.rangeStart}
            workListTotal={explorer.workListTotal}
          />
          <div className="px-6 py-4">
            <WorksExplorerFilters
              clearFilters={explorer.clearFilters}
              groupFilter={explorer.groupFilter}
              groupName={explorer.groupMap.get(Number(explorer.groupFilter))}
              groups={explorer.groups}
              isFilterActive={explorer.isFilterActive}
              riskStats={explorer.riskStats}
              setGroupFilter={explorer.setGroupFilter}
              setTitleFilter={explorer.setTitleFilter}
              titleFilter={explorer.titleFilter}
            />

            {explorer.errorMessage && (
              <p className="mt-4 text-sm text-destructive">{explorer.errorMessage}</p>
            )}

            <div className="mt-4">
              <WorksExplorerTable
                currentPage={explorer.currentPage}
                filteredWorkList={explorer.filteredWorkList}
                goToNextPage={explorer.goToNextPage}
                goToPreviousPage={explorer.goToPreviousPage}
                groupMap={explorer.groupMap}
                isSingleDay={explorer.isSingleDay}
                jumpToWorkMonth={explorer.jumpToWorkMonth}
                listLimit={explorer.listLimit}
                listOffset={explorer.listOffset}
                loading={explorer.loadingList}
                totalPages={explorer.totalPages}
                workList={explorer.workList}
                workListTotal={explorer.workListTotal}
              />
            </div>
          </div>
        </div>
        <div className="hidden lg:block">
          <div className="self-start lg:sticky lg:top-28">
            <WorksExplorerCalendarPanel
              hasWorkDates={explorer.hasWorkDates}
              loading={explorer.loadingDateSummary}
              month={explorer.month}
              onDaySelect={explorer.handleDaySelect}
              onMonthChange={explorer.handleMonthChange}
              onResetRange={explorer.handleResetRange}
              selectedDate={explorer.selectedDate}
            />
          </div>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        className="fixed bottom-6 right-6 z-30 h-12 w-12 rounded-full p-0 lg:hidden"
        onClick={() => explorer.setShowCalendar(true)}
      >
        <CalendarDays className="h-5 w-5" />
      </Button>
      {explorer.showCalendar && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/20 lg:hidden"
          onClick={() => explorer.setShowCalendar(false)}
        >
          <div
            className="absolute bottom-20 right-6 w-[320px] max-w-[calc(100vw-48px)]"
            onClick={(event) => event.stopPropagation()}
          >
            <WorksExplorerCalendarPanel
              hasWorkDates={explorer.hasWorkDates}
              loading={explorer.loadingDateSummary}
              month={explorer.month}
              onClose={() => explorer.setShowCalendar(false)}
              onDaySelect={(date) => {
                explorer.handleDaySelect(date)
                explorer.setShowCalendar(false)
              }}
              onMonthChange={explorer.handleMonthChange}
              onResetRange={explorer.handleResetRange}
              selectedDate={explorer.selectedDate}
            />
          </div>
        </div>
      )}
    </div>
  )
}