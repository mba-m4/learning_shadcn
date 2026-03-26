import { Button } from '@/components/ui/button'
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

interface Group {
  id: number
  name: string
}

interface User {
  id: number
  name: string
  contact?: string | null
  role: string
}

interface Props {
  getRoleLabel(role: string): string
  groups: Group[]
  memberGroupSelections: Record<number, number | ''>
  memberGroups: Record<number, number[]>
  onAddGroupToMember(userId: number): void
  onRemoveMemberFromGroup(userId: number, groupId: number): void
  onSelectionChange(userId: number, value: string): void
  users: User[]
}

export function GroupMembersSection({
  getRoleLabel,
  groups,
  memberGroupSelections,
  memberGroups,
  onAddGroupToMember,
  onRemoveMemberFromGroup,
  onSelectionChange,
  users,
}: Props) {
  return (
    <section className="rounded-xl border border-border/60 bg-white">
      <div className="border-b border-border/60 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">
              Members
            </p>
            <h2 className="mt-2 text-xl font-semibold">メンバー一覧</h2>
          </div>
          <span className="rounded-full border border-border/60 px-3 py-1 text-xs font-semibold text-muted-foreground">
            {users.length} members
          </span>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">ID</TableHead>
            <TableHead>名前</TableHead>
            <TableHead>連絡先</TableHead>
            <TableHead>権限</TableHead>
            <TableHead>所属グループ</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="text-muted-foreground">{user.id}</TableCell>
              <TableCell className="font-medium text-slate-900">{user.name}</TableCell>
              <TableCell className="text-muted-foreground">{user.contact || '-'}</TableCell>
              <TableCell>
                <span className="rounded-full border border-border/60 px-2 py-0.5 text-xs">
                  {getRoleLabel(user.role)}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  {(memberGroups[user.id] || []).length === 0 ? (
                    <span className="text-xs text-muted-foreground">未所属</span>
                  ) : (
                    (memberGroups[user.id] || []).map((groupId) => {
                      const group = groups.find((item) => item.id === groupId)
                      if (!group) {
                        return null
                      }
                      return (
                        <span
                          key={group.id}
                          className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-0.5 text-xs"
                        >
                          {group.name}
                          <button
                            type="button"
                            className="text-muted-foreground hover:text-slate-900"
                            onClick={() => onRemoveMemberFromGroup(user.id, group.id)}
                            aria-label={`${group.name} を削除`}
                          >
                            ×
                          </button>
                        </span>
                      )
                    })
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={memberGroupSelections[user.id]?.toString() ?? ''}
                    onValueChange={(value) => onSelectionChange(user.id, value)}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="グループを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id.toString()}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onAddGroupToMember(user.id)}
                    disabled={!memberGroupSelections[user.id]}
                  >
                    追加
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  )
}