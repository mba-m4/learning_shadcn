import type { DbTable } from '@/types/template'

interface DbSelectorProps {
  tables: DbTable[]
  selectedTableName: string
  onSelectTable: (tableName: string) => void
  disabled?: boolean
}

export function DbSelector({
  tables,
  selectedTableName,
  onSelectTable,
  disabled = false,
}: DbSelectorProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="db-table" className="text-xs font-medium text-muted-foreground">
        DBテーブル
      </label>
      <select
        id="db-table"
        value={selectedTableName}
        onChange={(event) => onSelectTable(event.target.value)}
        disabled={disabled}
        className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">テーブルを選択してください</option>
        {tables.map((table) => (
          <option key={table.name} value={table.name}>
            {table.name}
          </option>
        ))}
      </select>
      {selectedTableName && (
        <p className="text-xs text-muted-foreground">
          {tables.find((table) => table.name === selectedTableName)?.description}
        </p>
      )}
    </div>
  )
}
