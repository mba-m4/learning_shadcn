import PageHeader from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { useNotificationsPageController } from '@/features/notifications/model/useNotificationsPageController'
import { NotificationCreateSection } from '@/features/notifications/ui/NotificationCreateSection'
import { NotificationsTableSection } from '@/features/notifications/ui/NotificationsTableSection'

export default function NotificationsPage() {
  const controller = useNotificationsPageController()

  return (
    <div className="space-y-6">
      <PageHeader
        title="お知らせ管理"
        subtitle="全体通知を作成・管理します。"
        actions={
          <Button variant="outline" size="sm" onClick={controller.refetch}>
            再読み込み
          </Button>
        }
      />

      <NotificationCreateSection
        title={controller.title}
        content={controller.content}
        type={controller.type}
        link={controller.link}
        displayDays={controller.displayDays}
        noExpiry={controller.noExpiry}
        pinned={controller.pinned}
        pending={controller.createPending}
        notificationTypes={controller.notificationTypes}
        typeLabel={controller.typeLabel}
        onSubmit={controller.handleSubmit}
        onTitleChange={controller.setTitle}
        onContentChange={controller.setContent}
        onTypeChange={controller.setType}
        onLinkChange={controller.setLink}
        onDisplayDaysChange={controller.setDisplayDays}
        onNoExpiryChange={controller.setNoExpiry}
        onPinnedChange={controller.setPinned}
      />

      <NotificationsTableSection
        count={controller.notificationCount}
        errorMessage={controller.errorMessage}
        loading={controller.loading}
        notifications={controller.notifications}
        typeLabel={controller.typeLabel}
        typeStyles={controller.typeStyles}
        onOpenDetail={controller.openNotificationDetail}
      />
    </div>
  )
}
