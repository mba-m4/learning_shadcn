import PageHeader from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/shared/api/client'
import { useGroupsPageController } from '@/features/works/model/useGroupsPageController'
import { GroupCreateSection } from '@/features/works/ui/GroupCreateSection'
import { GroupsDirectorySection } from '@/features/works/ui/GroupsDirectorySection'
import { GroupMembersSection } from '@/features/works/ui/GroupMembersSection'

export default function GroupsPage() {
  const controller = useGroupsPageController()

  return (
    <div className="space-y-6">
      <PageHeader
        title="作業グループ管理"
        subtitle="作業グループを作成・確認します。"
        actions={
          <Button variant="outline" size="sm" onClick={controller.refetch}>
            再読み込み
          </Button>
        }
      />

      <GroupCreateSection
        name={controller.name}
        onNameChange={controller.setName}
        onSubmit={controller.handleSubmit}
      />

      <GroupsDirectorySection
        errorMessage={controller.error ? getErrorMessage(controller.error) : null}
        getRoleLabel={controller.getRoleLabel}
        groupCount={controller.groupCount}
        groupMemberSelections={controller.groupMemberSelections}
        groups={controller.groups}
        loading={controller.loadingGroups}
        membersByGroup={controller.membersByGroup}
        onAddMemberToGroup={controller.handleAddMemberToGroup}
        onRemoveMemberFromGroup={controller.handleRemoveMemberFromGroup}
        onSelectionChange={(groupId, value) =>
          controller.setGroupMemberSelections((previousSelections) => ({
            ...previousSelections,
            [groupId]: value ? Number(value) : '',
          }))
        }
        users={controller.users}
      />

      <GroupMembersSection
        getRoleLabel={controller.getRoleLabel}
        groups={controller.groups}
        memberGroupSelections={controller.memberGroupSelections}
        memberGroups={controller.memberGroups}
        onAddGroupToMember={controller.handleAddGroupToMember}
        onRemoveMemberFromGroup={controller.handleRemoveMemberFromGroup}
        onSelectionChange={(userId, value) =>
          controller.setMemberGroupSelections((previousSelections) => ({
            ...previousSelections,
            [userId]: value ? Number(value) : '',
          }))
        }
        users={controller.users}
      />
    </div>
  )
}