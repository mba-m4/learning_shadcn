import { Fragment } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { WorkItemWithRisks } from '@/types/api'

interface WorkItemListProps {
  items: WorkItemWithRisks[]
}

export default function WorkItemList({ items }: WorkItemListProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">作業項目がありません。</p>
  }

  return (
    <div className="rounded-lg border border-border/40 bg-transparent">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-900">
            <TableHead className="w-[32%] text-white">作業手順</TableHead>
            <TableHead className="text-white">説明</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(({ item }) => (
            <Fragment key={item.id}>
              <TableRow>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {item.description}
                </TableCell>
              </TableRow>
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
