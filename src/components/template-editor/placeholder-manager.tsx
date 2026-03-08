import { useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { PlaceholderMapping, DbColumn } from '@/types/template'

interface PlaceholderManagerProps {
  dbTable: string
  columns: DbColumn[]
  placeholders: PlaceholderMapping[]
  onChange: (nextPlaceholders: PlaceholderMapping[]) => void
  disabled?: boolean
}

export function PlaceholderManager({
  dbTable,
  columns,
  placeholders,
  onChange,
  disabled = false,
}: PlaceholderManagerProps) {
  const [placeholderName, setPlaceholderName] = useState('')
  const [columnName, setColumnName] = useState('')

  const usedColumns = useMemo(
    () => new Set(placeholders.map((item) => item.dbColumn)),
    [placeholders]
  )

  const handleAdd = () => {
    const trimmedName = placeholderName.trim()
    if (!trimmedName || !columnName || !dbTable) return

    const dbColumn = `${dbTable}.${columnName}`

    if (placeholders.some((item) => item.name === trimmedName)) {
      return
    }

    const next = [...placeholders, { name: trimmedName, dbColumn }]
    onChange(next)
    setPlaceholderName('')
    setColumnName('')
  }

  const handleDelete = (name: string) => {
    onChange(placeholders.filter((item) => item.name !== name))
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-muted-foreground">プレースホルダー管理</p>

      <div className="space-y-2 rounded-md border p-3">
        <Input
          placeholder="例: customer_name"
          value={placeholderName}
          onChange={(event) => setPlaceholderName(event.target.value)}
          disabled={disabled || !dbTable}
        />
        <select
          value={columnName}
          onChange={(event) => setColumnName(event.target.value)}
          disabled={disabled || !dbTable}
          className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">カラムを選択してください</option>
          {columns.map((column) => {
            const value = column.name
            const dbColumn = `${dbTable}.${value}`
            const isUsed = usedColumns.has(dbColumn)

            return (
              <option key={value} value={value} disabled={isUsed}>
                {value}
              </option>
            )
          })}
        </select>
        <Button onClick={handleAdd} disabled={disabled || !dbTable || !placeholderName.trim() || !columnName} className="w-full" size="sm">
          <Plus className="mr-2 size-4" />
          プレースホルダー追加
        </Button>
      </div>

      {placeholders.length === 0 ? (
        <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
          まだプレースホルダーがありません
        </div>
      ) : (
        <div className="space-y-2">
          {placeholders.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-2 rounded-md border p-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{`{{${item.name}}}`}</p>
                <p className="truncate text-xs text-muted-foreground">{item.dbColumn}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => handleDelete(item.name)}
                disabled={disabled}
                aria-label="プレースホルダーを削除"
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
