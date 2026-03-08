import type { DbTable } from '@/types/template'
import { Badge } from '@/components/ui/badge'

interface ColumnListProps {
  table?: DbTable
}

export function ColumnList({ table }: ColumnListProps) {
  if (!table) {
    return (
      <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
        テーブルを選択するとカラム一覧を表示します
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">カラム一覧</p>
      <div className="space-y-2">
        {table.columns.map((column) => (
          <div key={column.name} className="rounded-md border p-2">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium">{column.name}</span>
              <Badge variant="outline">{column.type}</Badge>
            </div>
            {column.description && (
              <p className="text-xs text-muted-foreground">{column.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
