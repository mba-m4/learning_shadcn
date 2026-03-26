import { Link } from 'react-router-dom'
import { CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { WorkListItem } from '@/types/api'

interface WorksExplorerTableProps {
  currentPage: number
  filteredWorkList: WorkListItem[]
  goToNextPage: () => void
  goToPreviousPage: () => void
  groupMap: Map<number, string>
  isSingleDay: boolean
  jumpToWorkMonth: (direction: 'next' | 'prev') => void
  listLimit: number
  listOffset: number
  loading: boolean
  totalPages: number
  workList: WorkListItem[]
  workListTotal: number
}

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

export default function WorksExplorerTable({
  currentPage,
  filteredWorkList,
  goToNextPage,
  goToPreviousPage,
  groupMap,
  isSingleDay,
  jumpToWorkMonth,
  listLimit,
  listOffset,
  loading,
  totalPages,
  workList,
  workListTotal,
}: WorksExplorerTableProps) {
  if (loading) {
    return <p className="text-sm text-muted-foreground">読み込み中...</p>
  }

  if (workList.length === 0) {
    return <p className="text-sm text-muted-foreground">データがありません。</p>
  }

  if (filteredWorkList.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        条件に一致する作業がありません。
      </p>
    )
  }

  return (
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
                <Link to={`/works/${entry.work.id}`} className="group block hover:underline">
                  <p className="font-semibold text-slate-900">{entry.work.title}</p>
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
          onClick={goToPreviousPage}
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
          onClick={goToNextPage}
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
  )
}