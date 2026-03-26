import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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
import { createGroup } from '@/lib/api/works'
import { useWorkStore } from '@/stores/workStore'
import { useIncidentStore } from '@/stores/incidentStore'

export default function GroupsPage() {
  const { groups, fetchGroups, loadingGroups, error } = useWorkStore()
  const { users, fetchUsers } = useIncidentStore()
  const [name, setName] = useState('')
  const [memberGroups, setMemberGroups] = useState<Record<number, number[]>>({})
  const [groupMemberSelections, setGroupMemberSelections] = useState<Record<number, number | ''>>({})
  const [memberGroupSelections, setMemberGroupSelections] = useState<Record<number, number | ''>>({})
  const groupCount = groups.length

  useEffect(() => {
    void fetchGroups()
    void fetchUsers()
  }, [fetchGroups, fetchUsers])

  useEffect(() => {
    setMemberGroups((prev) => {
      const next = { ...prev }
      users.forEach((user) => {
        if (!(user.id in next)) {
          next[user.id] = []
        }
      })
      return next
    })
    setGroupMemberSelections((prev) => {
      const next = { ...prev }
      groups.forEach((group) => {
        if (!(group.id in next)) {
          next[group.id] = ''
        }
      })
      return next
    })
    setMemberGroupSelections((prev) => {
      const next = { ...prev }
      users.forEach((user) => {
        if (!(user.id in next)) {
          next[user.id] = ''
        }
      })
      return next
    })
  }, [groups, users])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim()) {
      return
    }
    try {
      await createGroup(name.trim())
      toast.success('作業グループを作成しました。')
      setName('')
      await fetchGroups()
    } catch (error) {
      toast.error('作業グループの作成に失敗しました。')
    }
  }

  const membersByGroup = useMemo(() => {
    const map: Record<number, typeof users> = {}
    groups.forEach((group) => {
      map[group.id] = []
    })
    users.forEach((user) => {
      const groupIds = memberGroups[user.id] || []
      groupIds.forEach((groupId) => {
        if (map[groupId]) {
          map[groupId].push(user)
        }
      })
    })
    return map
  }, [groups, memberGroups, users])

  const handleAddMemberToGroup = (groupId: number) => {
    const userId = groupMemberSelections[groupId]
    if (!userId) {
      return
    }
    setMemberGroups((prev) => {
      const current = prev[userId] || []
      if (current.includes(groupId)) {
        return prev
      }
      return { ...prev, [userId]: [...current, groupId] }
    })
    setGroupMemberSelections((prev) => ({ ...prev, [groupId]: '' }))
    toast.success('メンバーを追加しました。')
  }

  const handleRemoveMemberFromGroup = (userId: number, groupId: number) => {
    setMemberGroups((prev) => ({
      ...prev,
      [userId]: (prev[userId] || []).filter((id) => id !== groupId),
    }))
  }

  const handleAddGroupToMember = (userId: number) => {
    const groupId = memberGroupSelections[userId]
    if (!groupId) {
      return
    }
    setMemberGroups((prev) => {
      const current = prev[userId] || []
      if (current.includes(groupId)) {
        return prev
      }
      return { ...prev, [userId]: [...current, groupId] }
    })
    setMemberGroupSelections((prev) => ({ ...prev, [userId]: '' }))
  }

  const roleLabel = (role: string) => {
    switch (role) {
      case 'leader':
        return 'リーダー'
      case 'safety_manager':
        return '安全管理者'
      default:
        return '作業者'
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="作業グループ管理"
        subtitle="作業グループを作成・確認します。"
        actions={
          <Button variant="outline" size="sm" onClick={() => fetchGroups()}>
            再読み込み
          </Button>
        }
      />
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
        <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap items-end gap-3">
          <div className="min-w-[240px] flex-1 space-y-2">
            <Label htmlFor="group-name">グループ名</Label>
            <Input
              id="group-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="設備点検"
            />
          </div>
          <Button type="submit" disabled={!name.trim()}>
            作成
          </Button>
        </form>
      </section>

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
          {error && <p className="text-sm text-destructive">{error}</p>}
          {loadingGroups ? (
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
                    <TableCell className="font-medium text-slate-900">
                      {group.name}
                    </TableCell>
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
                                onClick={() => handleRemoveMemberFromGroup(member.id, group.id)}
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
                          onValueChange={(value) =>
                            setGroupMemberSelections((prev) => ({
                              ...prev,
                              [group.id]: value ? Number(value) : '',
                            }))
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="メンバーを選択" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map((user) => (
                              <SelectItem key={user.id} value={user.id.toString()}>
                                {user.name} ({roleLabel(user.role)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddMemberToGroup(group.id)}
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
                <TableCell className="font-medium text-slate-900">
                  {user.name}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {user.contact || '-'}
                </TableCell>
                <TableCell>
                  <span className="rounded-full border border-border/60 px-2 py-0.5 text-xs">
                    {roleLabel(user.role)}
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
                              onClick={() => handleRemoveMemberFromGroup(user.id, group.id)}
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
                      onValueChange={(value) =>
                        setMemberGroupSelections((prev) => ({
                          ...prev,
                          [user.id]: value ? Number(value) : '',
                        }))
                      }
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
                      onClick={() => handleAddGroupToMember(user.id)}
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
    </div>
  )
}
