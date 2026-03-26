import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createUsersQueryOptions } from '@/features/incidents/api/queries'
import {
  createWorkGroupMutationOptions,
  createWorkGroupsQueryOptions,
} from '@/features/works/api/queries'
import { getErrorMessage } from '@/shared/api/client'

export const getRoleLabel = (role: string) => {
  switch (role) {
    case 'leader':
      return 'リーダー'
    case 'safety_manager':
      return '安全管理者'
    default:
      return '作業者'
  }
}

export function useGroupsPageController() {
  const groupsQuery = useQuery(createWorkGroupsQueryOptions())
  const usersQuery = useQuery(createUsersQueryOptions())
  const createGroupMutation = useMutation(createWorkGroupMutationOptions())
  const groups = groupsQuery.data ?? []
  const users = usersQuery.data ?? []
  const [name, setName] = useState('')
  const [memberGroups, setMemberGroups] = useState<Record<number, number[]>>({})
  const [groupMemberSelections, setGroupMemberSelections] = useState<Record<number, number | ''>>({})
  const [memberGroupSelections, setMemberGroupSelections] = useState<Record<number, number | ''>>({})

  useEffect(() => {
    setMemberGroups((previousGroups) => {
      const nextGroups = { ...previousGroups }
      users.forEach((user) => {
        if (!(user.id in nextGroups)) {
          nextGroups[user.id] = []
        }
      })
      return nextGroups
    })

    setGroupMemberSelections((previousSelections) => {
      const nextSelections = { ...previousSelections }
      groups.forEach((group) => {
        if (!(group.id in nextSelections)) {
          nextSelections[group.id] = ''
        }
      })
      return nextSelections
    })

    setMemberGroupSelections((previousSelections) => {
      const nextSelections = { ...previousSelections }
      users.forEach((user) => {
        if (!(user.id in nextSelections)) {
          nextSelections[user.id] = ''
        }
      })
      return nextSelections
    })
  }, [groups, users])

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim()) {
      return
    }
    try {
      await createGroupMutation.mutateAsync({ name: name.trim() })
      toast.success('作業グループを作成しました。')
      setName('')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleAddMemberToGroup = (groupId: number) => {
    const userId = groupMemberSelections[groupId]
    if (!userId) {
      return
    }
    setMemberGroups((previousGroups) => {
      const currentGroups = previousGroups[userId] || []
      if (currentGroups.includes(groupId)) {
        return previousGroups
      }
      return { ...previousGroups, [userId]: [...currentGroups, groupId] }
    })
    setGroupMemberSelections((previousSelections) => ({ ...previousSelections, [groupId]: '' }))
    toast.success('メンバーを追加しました。')
  }

  const handleRemoveMemberFromGroup = (userId: number, groupId: number) => {
    setMemberGroups((previousGroups) => ({
      ...previousGroups,
      [userId]: (previousGroups[userId] || []).filter((id) => id !== groupId),
    }))
  }

  const handleAddGroupToMember = (userId: number) => {
    const groupId = memberGroupSelections[userId]
    if (!groupId) {
      return
    }
    setMemberGroups((previousGroups) => {
      const currentGroups = previousGroups[userId] || []
      if (currentGroups.includes(groupId)) {
        return previousGroups
      }
      return { ...previousGroups, [userId]: [...currentGroups, groupId] }
    })
    setMemberGroupSelections((previousSelections) => ({ ...previousSelections, [userId]: '' }))
  }

  return {
    error: groupsQuery.error ?? usersQuery.error,
    getRoleLabel,
    groupCount: groups.length,
    groupMemberSelections,
    groups,
    handleAddGroupToMember,
    handleAddMemberToGroup,
    handleRemoveMemberFromGroup,
    handleSubmit,
    loadingGroups: groupsQuery.isLoading || groupsQuery.isFetching,
    memberGroupSelections,
    memberGroups,
    membersByGroup,
    name,
    refetch: () => {
      void groupsQuery.refetch()
      void usersQuery.refetch()
    },
    setGroupMemberSelections,
    setMemberGroupSelections,
    setName,
    users,
  }
}