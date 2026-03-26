import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  name: string
  onNameChange(value: string): void
  onSubmit(event: React.FormEvent<HTMLFormElement>): void
}

export function GroupCreateSection({ name, onNameChange, onSubmit }: Props) {
  return (
    <section className="rounded-xl border border-border/60 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">
            Create
          </p>
          <h2 className="mt-2 text-xl font-semibold">新規グループ作成</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            現場の用途に合わせて作業グループを整理します。
          </p>
        </div>
      </div>
      <form onSubmit={onSubmit} className="mt-4 flex flex-wrap items-end gap-3">
        <div className="min-w-[240px] flex-1 space-y-2">
          <Label htmlFor="group-name">グループ名</Label>
          <Input
            id="group-name"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="設備点検"
          />
        </div>
        <Button type="submit" disabled={!name.trim()}>
          作成
        </Button>
      </form>
    </section>
  )
}