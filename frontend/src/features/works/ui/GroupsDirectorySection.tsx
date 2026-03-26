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
  role: string
}

interface Props {
  errorMessage: string | null
  getRoleLabel(role: string): string
  groupCount: number
  groupMemberSelections: Record<number, number | ''>
  groups: Group[]
  loading: boolean
  membersByGroup: Record<number, User[]>
  onAddMemberToGroup(groupId: number): void
  onRemoveMemberFromGroup(userId: number, groupId: number): void
  onSelectionChange(groupId: number, value: string): void
  users: User[]
}

export function GroupsDirectorySection({
  errorMessage,
  getRoleLabel,
  groupCount,
  groupMemberSelections,
  groups,
  loading,
  membersByGroup,
  onAddMemberToGroup,
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
              Directory
            </p>
            <h2 className="mt-2 text-xl font-semibold">グループ一覧</h2>
          </div>
          <span className="rounded-full border border-border/60 px-3 py-1 text-xs font-semibold text-muted-foreground">
            {groupCount} groups
          </span>
        </div>
      </div>
      <div className="px-6 py-4">
        {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
        {loading ? (
          <p className="text-sm text-muted-foreground">読み込み中...</p>
        ) : groupCount === 0 ? (
          <p className="text-sm text-muted-foreground">グループはまだ登録されていません。</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>グループ名</TableHead>
                <TableHead className="w-16">ID</TableHead>
                <TableHead>メンバー</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium text-slate-900">{group.name}</TableCell>
                  <TableCell className="text-muted-foreground">{group.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {(membersByGroup[group.id] || []).length === 0 ? (
                        <span className="text-xs text-muted-foreground">未設定</span>
                      ) : (
                        (membersByGroup[group.id] || []).map((member) => (
                          <span
                            key={member.id}
                            className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-0.5 text-xs"
                          >
                            {member.name}
                            <button
                              type="button"
                              className="text-muted-foreground hover:text-slate-900"
                              onClick={() => onRemoveMemberFromGroup(member.id, group.id)}
                              aria-label={`${member.name} を削除`}
                            >
                              ×
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      <Select
                        value={groupMemberSelections[group.id]?.toString() ?? ''}
                        onValueChange={(value) => onSelectionChange(group.id, value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="メンバーを選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.name} ({getRoleLabel(user.role)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => onAddMemberToGroup(group.id)}
                        disabled={!groupMemberSelections[group.id]}
                      >
                        追加
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </section>
  )
}